import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { getUser } from '../auth/auth-user';

interface ErrorBody {
  statusCode: number;
  message: string | string[];
}

const PRISMA_STATUS_MAP: Record<string, HttpStatus> = {
  P2003: HttpStatus.NOT_FOUND,
  P2025: HttpStatus.NOT_FOUND,
};

const PRISMA_ERROR_MESSAGE: Record<string, string> = {
  P2003: 'Ссылка на несуществующую запись',
  P2025: 'Запись не найдена',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType<string>() === 'graphql') {
      const { statusCode, message } = this.resolve(exception);
      throw new GraphQLError(
        Array.isArray(message) ? message.join('; ') : message,
        {
          extensions: {
            statusCode,
            code: this.graphqlCode(statusCode),
          },
        },
      );
    }

    if (host.getType() !== 'http') {
      return exception;
    }

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { statusCode, message } = this.resolve(exception);

    if (request.path.startsWith('/api')) {
      response.status(statusCode).json({
        statusCode,
        message,
        path: request.path,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    response.status(statusCode).render('error', {
      title: `Ошибка ${statusCode} - ReadFinder`,
      styles: ['/styles/template.css', '/styles/error.css'],
      user: getUser(request),
      scripts: [],
      statusCode,
      message: Array.isArray(message) ? message.join('; ') : message,
      serverElapsedMs: response.locals.serverElapsedMs as string | undefined,
    });
  }

  private resolve(exception: unknown): ErrorBody {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const raw = exception.getResponse();
      const message = this.extractMessage(raw);
      return {
        statusCode,
        message,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const statusCode =
        PRISMA_STATUS_MAP[exception.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
      return {
        statusCode,
        message:
          PRISMA_ERROR_MESSAGE[exception.code] ??
          `Ошибка базы данных (${exception.code})`,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Внутренняя ошибка сервера',
    };
  }

  private extractMessage(raw: unknown): string | string[] {
    if (typeof raw === 'string') return raw;
    if (raw && typeof raw === 'object' && 'message' in raw) {
      return (raw as { message: string | string[] }).message;
    }
    return 'Произошла ошибка';
  }

  private graphqlCode(statusCode: HttpStatus): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_USER_INPUT';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHENTICATED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
