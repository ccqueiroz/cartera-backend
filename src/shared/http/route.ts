import type { NextFunction, Request, Response } from 'express';
import type { Middleware } from '@/shared/http/middleware';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type HttpHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => unknown;

/**
 * Contrato de rota que cada feature (infra) produz e o bootstrap monta.
 * As features dependem deste contrato, não do Express diretamente.
 */
export interface Route {
  readonly method: HttpMethod;
  readonly path: string;
  readonly handler: HttpHandler;
  readonly middlewares?: Middleware[];
  /** Limite do body parser só desta rota (ex.: '8mb' para avatar base64). */
  readonly bodyLimit?: string;
}
