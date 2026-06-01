import { Request, Response, NextFunction } from 'express';
import {
  ErrorHttpMiddleware,
  ErrorMiddleware as ErrorMiddlewareInterface,
} from '@/shared/http/middleware';
import {
  BusinessRuleViolationError,
  DomainError,
  DuplicateEntityError,
  EntityNotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { LoggerGateway } from '@/shared/logger/logger.gateway';

export class ErrorMiddleware implements ErrorMiddlewareInterface {
  private constructor(private readonly logger: LoggerGateway) {}

  public static create(logger: LoggerGateway): ErrorMiddleware {
    return new ErrorMiddleware(logger);
  }

  private statusFor(error: Error): number {
    if (error instanceof ValidationError) return 400;
    if (error instanceof UnauthorizedError) return 401;
    if (error instanceof EntityNotFoundError) return 404;
    if (error instanceof DuplicateEntityError) return 409;
    if (error instanceof BusinessRuleViolationError) return 422;
    if (error instanceof DomainError) return 400;
    return 500;
  }

  public getHandler(): ErrorHttpMiddleware {
    return (
      error: Error,
      _request: Request,
      response: Response,
      _next: NextFunction,
    ) => {
      const statusCode = this.statusFor(error);
      const message =
        statusCode === 500 ? 'Erro interno no servidor.' : error.message;

      this.logger.error(`{[STATUS]: ${statusCode}}: ${error.stack}`);

      response.status(statusCode).json({ message });
    };
  }
}
