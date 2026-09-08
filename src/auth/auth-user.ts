import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser | null;
      userId?: string;
    }
  }
}

export function getUser(req: Request): AuthUser | null {
  return req.user ?? null;
}

export function requireUser(req: Request): AuthUser {
  const user = getUser(req);
  if (!user) {
    throw new UnauthorizedException('Требуется аутентификация');
  }
  return user;
}

export function requireUserId(req: Request): string {
  const userId = req.userId;
  if (!userId) {
    throw new UnauthorizedException('Требуется аутентификация');
  }
  return userId;
}

export function viewUser(user: AuthUser | null): {
  name: string;
  role: string;
} | null {
  return user ? { name: user.name, role: user.role } : null;
}

export function requireSessionUserId(ctx: {
  sessionUserId?: string;
  req?: Request & { userId?: string };
}): string {
  const id = ctx.sessionUserId ?? ctx.req?.userId;
  if (!id) {
    throw new UnauthorizedException('Требуется аутентификация');
  }
  return id;
}
