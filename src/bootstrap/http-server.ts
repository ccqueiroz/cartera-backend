import express, { Express, json } from 'express';
import type { Server } from 'http';
import { Route } from '@/shared/http/route';

/** Servidor HTTP mínimo. Recebe Route[] já compostas pelas factories. */
export class HttpServer {
  private readonly app: Express;
  private server?: Server;

  private constructor(routes: Route[]) {
    this.app = express();
    this.app.use(json());
    this.app.disable('x-powered-by');
    this.mount(routes);
  }

  public static create(routes: Route[]): HttpServer {
    return new HttpServer(routes);
  }

  private mount(routes: Route[]): void {
    for (const route of routes) {
      this.app[route.method](
        `/api/${route.path}`,
        ...(route.middlewares ?? []),
        route.handler,
      );
    }
  }

  /** Exposto para testes de integração (supertest). */
  public get instance(): Express {
    return this.app;
  }

  public start(port: number, onListen?: () => void): Server {
    this.server = this.app.listen(port, onListen);
    return this.server;
  }
}
