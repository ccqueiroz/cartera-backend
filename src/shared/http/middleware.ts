import type { NextFunction, Request, Response } from 'express';

export type HttpMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
) => Promise<void>;

export type ErrorHttpMiddleware = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction,
) => void | Promise<void>;

/**
 * Contrato único de middleware: serve tanto para registro global (`app.use`)
 * quanto por rota (`Route.middlewares`). Só muda o ponto de entrada.
 */
export interface Middleware {
  getHandler(): HttpMiddleware;
}

export interface ErrorMiddleware {
  getHandler(): ErrorHttpMiddleware;
}
