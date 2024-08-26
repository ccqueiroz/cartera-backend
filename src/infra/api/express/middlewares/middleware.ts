import { ApiError } from '@/helpers/errors';
import { NextFunction, Request, Response } from 'express';

export type HttpMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
) => Promise<void>;

export interface Middleware {
  getHandler(): HttpMiddleware;
}

export interface ErrorMiddleware {
  getHandler(): (
    error: Error & ApiError,
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
}
