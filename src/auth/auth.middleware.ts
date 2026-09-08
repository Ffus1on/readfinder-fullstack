import { Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import Session from 'supertokens-node/recipe/session';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

const STATIC_PREFIXES = [
  '/styles',
  '/javascript',
  '/images',
  '/files',
  '/favicon.ico',
];

const PROTECTED_FORM_PATTERNS: RegExp[] = [
  /^\/books\/add\/?$/,
  /^\/books\/[^/]+\/edit\/?$/,
  /^\/libraries\/add\/?$/,
  /^\/libraries\/[^/]+\/edit\/?$/,
  /^\/events\/add\/?$/,
  /^\/events\/[^/]+\/edit\/?$/,
  /^\/admin\/?/,
  /^\/profile\/?$/,
  /^\/auth\/change-password\/?$/,
];

@Injectable()
export class AuthMiddleware {
  constructor(private readonly usersService: UsersService) {}

  private requestPath(req: Request): string {
    return req.originalUrl.split('?')[0] ?? '/';
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const path = this.requestPath(req);

    if (STATIC_PREFIXES.some((p) => path.startsWith(p))) {
      return next();
    }

    if (path.startsWith('/api') || path === '/graphql') {
      return next();
    }

    let session: Awaited<ReturnType<typeof Session.getSession>>;
    try {
      session = await Session.getSession(req, res, {
        sessionRequired: false,
        overrideGlobalClaimValidators: () => [],
      });
    } catch {
      session = undefined;
    }

    const isMutation = ['POST', 'PATCH', 'DELETE', 'PUT'].includes(req.method);
    const isProtectedForm =
      req.method === 'GET' &&
      PROTECTED_FORM_PATTERNS.some((re) => re.test(path));
    const isFavoritesPage =
      path === '/favorites' || path.startsWith('/favorites/');

    if (isMutation) {
      if (!session) {
        return this.redirectToLogin(res, req);
      }
      return next();
    }

    let user: Awaited<ReturnType<UsersService['findByIdOrNull']>> = null;
    if (session) {
      user = await this.usersService.findByIdOrNull(
        AuthService.resolveDbUserId(session),
      );
    }
    req.user = user;

    if (!user && (isProtectedForm || isFavoritesPage)) {
      return this.redirectToLogin(res, req);
    }

    next();
  }

  private redirectToLogin(res: Response, req: Request) {
    const loginUrl = `/auth/login?redirect=${encodeURIComponent(req.originalUrl)}`;
    return res.redirect(loginUrl);
  }
}
