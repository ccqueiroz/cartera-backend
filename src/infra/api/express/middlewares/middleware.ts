import { ApiError } from '@/helpers/errors';
import { NextFunction, Request, Response } from 'express';

export interface Middleware {
  getHandler(): (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
}

export interface ErrorMiddleware {
  getHandler(): (
    error: Error & ApiError,
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
}
