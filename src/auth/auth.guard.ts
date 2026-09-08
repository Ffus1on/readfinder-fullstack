import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import Session from 'supertokens-node/recipe/session';
import { PUBLIC_ACCESS_KEY } from './public.decorator';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) {
      return true;
    }

    const { req, res } = this.extractReqRes(context);

    const preResolved =
      context.getType<string>() === 'graphql' ? req.userId : undefined;
    if (preResolved) {
      return true;
    }

    try {
      const session = await Session.getSession(req, res, {
        sessionRequired: true,
        overrideGlobalClaimValidators: () => [],
      });
      req.userId = AuthService.resolveDbUserId(session);
      return true;
    } catch {
      throw new UnauthorizedException('Требуется аутентификация');
    }
  }

  private extractReqRes(context: ExecutionContext): {
    req: Request;
    res: Response;
  } {
    if (context.getType<string>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context).getContext<{
        req?: Request;
        res?: Response;
        sessionUserId?: string;
      }>();
      const req = ctx.req ?? ({ headers: {} } as unknown as Request);
      if (ctx.sessionUserId) {
        req.userId = ctx.sessionUserId;
      }
      return { req, res: ctx.res ?? ({ headers: {} } as unknown as Response) };
    }
    const http = context.switchToHttp();
    return {
      req: http.getRequest<Request>(),
      res: http.getResponse<Response>(),
    };
  }
}
