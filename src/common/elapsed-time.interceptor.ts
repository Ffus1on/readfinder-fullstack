import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { Observable, finalize, map } from 'rxjs';

@Injectable()
export class ElapsedTimeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ElapsedTimeInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = performance.now();
    const contextType: string = context.getType();

    if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const apolloCtx = gqlContext.getContext<{
        req?: Request;
        res?: Response;
      }>();
      const res = apolloCtx?.res ?? apolloCtx?.req?.res;
      return next.handle().pipe(
        finalize(() => {
          const elapsed = this.elapsed(start, 'GraphQL request');
          res?.setHeader('X-Elapsed-Time', String(elapsed));
        }),
      );
    }

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    if (this.isSse(req)) {
      return next.handle();
    }

    const label = `${req.method} ${req.originalUrl}`;

    return next.handle().pipe(
      map((data: unknown) => {
        if (this.isMvcPage(req)) {
          const elapsed = this.millis(start);
          return data && typeof data === 'object' && !Array.isArray(data)
            ? {
                ...(data as Record<string, unknown>),
                serverElapsedMs: String(elapsed),
              }
            : data;
        }
        return data;
      }),
      finalize(() => {
        const elapsed = this.elapsed(start, label);
        res.setHeader('X-Elapsed-Time', String(elapsed));
        res.locals.serverElapsedMs = String(elapsed);
      }),
    );
  }

  private millis(start: number): number {
    return Math.round(performance.now() - start);
  }

  private elapsed(start: number, label: string): number {
    const ms = this.millis(start);
    this.logger.log(`${ms}ms ${label}`);
    return ms;
  }

  private isSse(req: Request): boolean {
    const path = (req.originalUrl ?? req.url ?? '').split('?')[0];
    return req.headers.accept === 'text/event-stream' || path.endsWith('/sse');
  }

  private isMvcPage(req: Request): boolean {
    const path = req.originalUrl ?? req.url ?? '';
    return !path.startsWith('/api') && !path.startsWith('/graphql');
  }
}
