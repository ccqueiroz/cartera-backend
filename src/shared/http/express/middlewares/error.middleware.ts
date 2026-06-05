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
  ForbiddenError,
  PayloadTooLargeError,
  UnauthorizedError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { errorCatalog } from '@/shared/kernel/errors/error-catalog';
import { HttpStatus } from '@/shared/http/http-status';
import { LoggerGateway } from '@/shared/logger/logger.gateway';

export class ErrorMiddleware implements ErrorMiddlewareInterface {
  private constructor(private readonly logger: LoggerGateway) {}

  public static create(logger: LoggerGateway): ErrorMiddleware {
    return new ErrorMiddleware(logger);
  }

  private statusFor(error: Error): HttpStatus {
    if (error instanceof ValidationError) return HttpStatus.BAD_REQUEST;
    if (error instanceof UnauthorizedError) return HttpStatus.UNAUTHORIZED;
    if (error instanceof ForbiddenError) return HttpStatus.FORBIDDEN;
    if (error instanceof EntityNotFoundError) return HttpStatus.NOT_FOUND;
    if (error instanceof DuplicateEntityError) return HttpStatus.CONFLICT;
    if (error instanceof PayloadTooLargeError)
      return HttpStatus.PAYLOAD_TOO_LARGE;
    if (error instanceof BusinessRuleViolationError)
      return HttpStatus.UNPROCESSABLE_ENTITY;
    if (error instanceof DomainError) return HttpStatus.BAD_REQUEST;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  public getHandler(): ErrorHttpMiddleware {
    return (
      error: Error,
      _request: Request,
      response: Response,
      _next: NextFunction,
    ) => {
      const status = this.statusFor(error);
      const code =
        error instanceof DomainError
          ? error.code
          : ErrorCode.INTERNAL_SERVER_ERROR;
      const params = error instanceof DomainError ? error.params : undefined;
      const message = errorCatalog[code](params);

      this.logger.error(
        `{[STATUS]: ${status}}{[CODE]: ${code}}: ${error.stack}`,
      );

      response.status(status).json({ message });
    };
  }
}
