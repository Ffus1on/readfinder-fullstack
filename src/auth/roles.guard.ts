import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';
import { UsersService } from '../users/users.service';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = this.extractReq(context);
    const userId = req?.userId;

    if (!userId) {
      throw new UnauthorizedException('Пользователь не аутентифицирован');
    }

    const user = await this.usersService.findByIdOrNull(userId);
    if (!user) {
      throw new ForbiddenException('Пользователь не найден');
    }
    const normalized = requiredRoles.map((r) => r.toUpperCase());
    if (!normalized.includes(user.role.toUpperCase())) {
      throw new ForbiddenException('Недостаточно прав для доступа');
    }
    return true;
  }

  private extractReq(
    context: ExecutionContext,
  ): (Request & { userId?: string }) | undefined {
    if (context.getType<string>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context).getContext<{
        req?: Request & { userId?: string };
        sessionUserId?: string;
      }>();
      if (ctx.sessionUserId && ctx.req && !ctx.req.userId) {
        ctx.req.userId = ctx.sessionUserId;
      }
      return ctx.req;
    }
    return context.switchToHttp().getRequest<Request>();
  }
}
