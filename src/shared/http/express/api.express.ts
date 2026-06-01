import express, { type Express, json } from 'express';
import type { Server } from 'http';
import { Route } from '@/shared/http/route';
import { ErrorMiddleware, Middleware } from '@/shared/http/middleware';

export interface BootstrapLogger {
  info(message: string): void;
}

export interface BootstrapCache {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export interface SwaggerMounter {
  mount(app: Express): void;
}

export interface ApiExpressDeps {
  routes: Route[];
  globalMiddlewares: Middleware[];
  errorMiddleware: ErrorMiddleware;
  logger: BootstrapLogger;
  cache: BootstrapCache;
  swaggerSetup: SwaggerMounter;
}

export class ApiExpress {
  private readonly app: Express;
  private server?: Server;

  private constructor(private readonly deps: ApiExpressDeps) {
    this.app = express();
    this.app.use(json());
    this.app.set('x-powered-by', false);
    this.registerGlobalMiddlewares();
    this.registerRoutes();
    this.deps.swaggerSetup.mount(this.app);
    this.registerErrorHandling();
  }

  public static create(deps: ApiExpressDeps): ApiExpress {
    return new ApiExpress(deps);
  }

  private registerGlobalMiddlewares(): void {
    this.deps.globalMiddlewares.forEach((middleware) => {
      this.app.use(middleware.getHandler());
    });
  }

  private registerRoutes(): void {
    this.deps.routes.forEach((route) => {
      const middlewares = (route.middlewares ?? []).map((middleware) =>
        middleware.getHandler(),
      );

      this.app[route.method](
        `/api/${route.path}`,
        ...middlewares,
        route.handler,
      );
    });
  }

  private registerErrorHandling(): void {
    this.app.use(this.deps.errorMiddleware.getHandler());
  }

  private listRoutes(): void {
    this.deps.routes.forEach((route) => {
      this.deps.logger.info(
        `[ROUTE] ${route.method.toUpperCase()} /api/${route.path}`,
      );
    });
  }

  public async start(port: number): Promise<void> {
    await this.deps.cache.connect();

    this.server = this.app.listen(port, '0.0.0.0', () => {
      this.deps.logger.info(`Server running on port ${port}`);
      this.listRoutes();
    });

    this.server.on('error', () => {
      void this.shutdown('SERVER_ERROR');
    });

    process.on('SIGINT', () => void this.shutdown('SIGINT'));
    process.on('SIGTERM', () => void this.shutdown('SIGTERM'));
  }

  private async shutdown(signal: string): Promise<void> {
    this.deps.logger.info(`${signal}: safely closing application`);
    await this.deps.cache.disconnect();
    this.server?.close();
  }

  public get instance(): Express {
    return this.app;
  }
}
