import { Request, Response, NextFunction } from 'express';
import { ApiError } from './../../../../helpers/errors/ApiErrors';
import { ErrorMiddleware as ErrorMiddlewareInterface } from './middleware';

export class ErrorMiddleware implements ErrorMiddlewareInterface {
  public getHandler() {
    return async (
      error: Error & ApiError,
      request: Request,
      response: Response,
      next: NextFunction,
    ) => {
      const statusCode = error.statusCode ?? 500;
      const message = error.message;

      response.status(statusCode).json({ message });
    };
  }
}
