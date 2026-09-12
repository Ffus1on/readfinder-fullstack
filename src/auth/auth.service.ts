import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import supertokens, { RecipeUserId } from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import { middleware, errorHandler } from 'supertokens-node/framework/express';
import type { Request, Response } from 'express';
import { AUTH_MODULE_OPTIONS } from './auth.config';
import type { AuthModuleOptions } from './auth.config';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private initialized = false;

  constructor(
    @Inject(AUTH_MODULE_OPTIONS)
    private readonly options: AuthModuleOptions,
    private readonly usersService: UsersService,
  ) {}

  onModuleInit() {
    this.init();
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    supertokens.init({
      appInfo: {
        appName: this.options.appName,
        apiDomain: this.options.apiDomain,
        websiteDomain: this.options.websiteDomain,
        apiBasePath: this.options.apiBasePath,
        websiteBasePath: this.options.websiteBasePath,
      },
      supertokens: {
        connectionURI: this.options.connectionURI,
        apiKey: this.options.apiKey,
      },
      recipeList: [
        EmailPassword.init(),
        Session.init({
          getTokenTransferMethod: () => 'cookie',
        }),
      ],
    });
  }

  async syncPrismaUser(stUserId: string, email: string, name?: string) {
    const existingById = await this.usersService.findByIdOrNull(stUserId);
    if (existingById) return existingById;

    return this.usersService.createWithId(stUserId, {
      email,
      name: name || email.split('@')[0],
    });
  }

  async createSession(
    req: Request,
    res: Response,
    recipeUserId: RecipeUserId,
    dbUserId: string,
  ) {
    return Session.createNewSession(req, res, 'public', recipeUserId, {
      userId: dbUserId,
    });
  }

  static resolveDbUserId(session: {
    getAccessTokenPayload: () => Record<string, unknown>;
    getUserId: () => string;
  }): string {
    const payload = session.getAccessTokenPayload() as { userId?: string };
    return payload.userId ?? session.getUserId();
  }

  async signOut(req: Request, res: Response) {
    try {
      const session = await Session.getSession(req, res, {
        sessionRequired: false,
        overrideGlobalClaimValidators: () => [],
      });
      if (session) {
        await session.revokeSession();
      }
    } catch (e) {
      this.logger.warn(`Ошибка при выходе: ${(e as Error).message}`);
    }
    res.clearCookie('sAccessToken', { path: '/' });
    res.clearCookie('sRefreshToken', {
      path: `${this.options.apiBasePath}/session/refresh`,
    });
    res.clearCookie('sIdRefreshToken', { path: '/' });
  }

  async changePassword(
    req: Request,
    res: Response,
    currentPassword: string,
    newPassword: string,
  ): Promise<
    { ok: true } | { ok: false; reason: 'current' | 'password' | 'server' }
  > {
    let session: {
      getHandle: () => string;
      getUserId: () => string;
      getAccessTokenPayload: () => Record<string, unknown>;
    };
    try {
      session = await Session.getSession(req, res, {
        sessionRequired: true,
        overrideGlobalClaimValidators: () => [],
      });
    } catch {
      return { ok: false, reason: 'server' };
    }

    const user = await this.usersService.findByIdOrNull(
      AuthService.resolveDbUserId(session),
    );
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    try {
      const signIn = await EmailPassword.signIn(
        'public',
        user.email,
        currentPassword,
      );
      if (signIn.status !== 'OK') {
        return { ok: false, reason: 'current' };
      }
    } catch {
      return { ok: false, reason: 'server' };
    }

    try {
      const result = await EmailPassword.updateEmailOrPassword({
        recipeUserId: new RecipeUserId(session.getUserId()),
        password: newPassword,
        applyPasswordPolicy: true,
      });
      if (result.status === 'PASSWORD_POLICY_VIOLATED_ERROR') {
        return { ok: false, reason: 'password' };
      }
      if (result.status !== 'OK') {
        return { ok: false, reason: 'server' };
      }
    } catch {
      return { ok: false, reason: 'server' };
    }

    await this.revokeOtherSessions(session);
    return { ok: true };
  }

  private async revokeOtherSessions(session: {
    getHandle: () => string;
    getUserId: () => string;
  }) {
    const currentHandle = session.getHandle();
    try {
      const handles = await Session.getAllSessionHandlesForUser(
        session.getUserId(),
      );
      await Promise.all(
        handles
          .filter((handle) => handle !== currentHandle)
          .map((handle) => Session.revokeSession(handle)),
      );
    } catch (e) {
      this.logger.warn(
        `Не удалось отозвать остальные сессии после смены пароля: ${(e as Error).message}`,
      );
    }
  }

  getMiddleware() {
    return middleware();
  }

  getErrorHandler() {
    return errorHandler();
  }
}
