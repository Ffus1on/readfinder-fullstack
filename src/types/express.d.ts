import type { AuthUser } from '../auth/auth-user';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser | null;
      userId?: string;
    }
  }
}
