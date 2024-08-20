import { NextFunction, Request, Response } from 'express';

export type HttpMethod = 'get' | 'post' | 'put' | 'delete';

export const HttpMethod = {
  GET: 'get' as HttpMethod,
  POST: 'post' as HttpMethod,
  PUT: 'put' as HttpMethod,
  DELETE: 'delete' as HttpMethod,
} as const;

export type HttpMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
) => void;

export interface Route {
  getHandler(): (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
  getPath(): string;
  getMethod(): HttpMethod;
  getMiddlewares(): Array<HttpMiddleware>;
}

export interface MapRoutes {
  execute(): Array<Route>;
}
