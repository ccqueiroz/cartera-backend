import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../../../helpers/errors/ApiErrors';
import { ErrorMiddleware as ErrorMiddlewareInterface } from './middleware';
import { LoggerGateway } from '@/domain/Helpers/gateway/logger.gateway';

export class ErrorMiddleware implements ErrorMiddlewareInterface {
  constructor(readonly loggerError: LoggerGateway['error']) {}

  public getHandler() {
    return async (
      error: Error & ApiError,
      request: Request,
      response: Response,
      next: NextFunction,
    ) => {
      const statusCode = error.statusCode ?? 500;
      const message = error.message;

      this.loggerError(`{[STATUS]: ${statusCode}}: ${error.stack}`);

      response.status(statusCode).json({ message });

      next(error);
    };
  }
}
