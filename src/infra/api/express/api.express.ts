import { ErrorMiddleware, Middleware } from './middlewares/middleware';
import express, { Express, json } from 'express';
import { Api } from './api';
import { Route } from './routes/route';
import {
  API_DOC,
  swaggerServer,
  swaggerSetup,
  swaggerSpecInstance,
} from '@/packages/clients/swagger';
import { LoggerGateway } from '@/domain/Helpers/gateway/logger.gateway';
import { CacheGateway } from '@/domain/Cache/gateway/cache.gateway';
import { Server } from 'http';
export class ApiExpress implements Api {
  private static instance: ApiExpress;
  private app: Express;
  private logger: LoggerGateway;
  private cache: CacheGateway;
  private serverListner!: Server;

  private constructor(
    routes: Array<Route>,
    globalMiddlewares: Array<Middleware>,
    errorMiddleware: ErrorMiddleware,
    logger: LoggerGateway,
    cache: CacheGateway,
  ) {
    this.cache = cache;
    this.logger = logger;
    this.app = express();
    this.app.use(json());
    this.app.set('x-powered-by', false);
    this.app.set('trust proxy', true);
    this.addGlobalMiddlewares(globalMiddlewares);
    this.addSwagger();
    this.addRoutes(routes);
    this.addErrorHandling(errorMiddleware);
  }

  public static create(
    routes: Array<Route>,
    globalMiddlewares: Array<Middleware>,
    errorMiddleware: ErrorMiddleware,
    logger: LoggerGateway,
    cache: CacheGateway,
  ) {
    if (!ApiExpress.instance) {
      ApiExpress.instance = new ApiExpress(
        routes,
        globalMiddlewares,
        errorMiddleware,
        logger,
        cache,
      );
    }
    return ApiExpress.instance;
  }

  private addRoutes(routes: Array<Route>) {
    routes.forEach((route: Route) => {
      const path = route.getPath();
      const method = route.getMethod();
      const handler = route.getHandler();
      const middlewares = route.getMiddlewares();

      this.app[method](`/api/${path}`, [...middlewares], handler);
    });
  }

  private addGlobalMiddlewares(middlewares: Array<Middleware>) {
    middlewares.forEach((middleware) => {
      this.app.use(middleware.getHandler());
    });
  }

  private addErrorHandling(errorMiddleware: ErrorMiddleware) {
    this.app.use(errorMiddleware.getHandler());
  }

  private addSwagger() {
    this.app.use(API_DOC, swaggerServer, swaggerSetup(swaggerSpecInstance));
  }

  private async shutdown(signal: string) {
    this.logger.info(`${signal}: Safely closing application!`);

    await this.cache.disconnect();
    this.serverListner.close();

    this.logger.info('Complete shutdown.');
  }

  public async start(port: number) {
    await this.cache.connect();

    this.serverListner = this.app.listen(port, '0.0.0.0', () => {
      this.logger.info(`Server running on port ${port}`);
      this.listRoutes();
    });

    this.serverListner.on('error', async () => {
      await this.shutdown('SERVER_ERROR');
    });

    process.on('SIGINT', this.shutdown.bind(this));
    process.on('SIGTERM', this.shutdown.bind(this));
  }

  private listRoutes() {
    const routes = this.app._router.stack
      .filter((route: any) => route.route)
      .map((route: any) => {
        return {
          path: route.route.path,
          method: route.route.stack[0].method,
        };
      });
    this.logger.info(`Swagger UI ->  ${process.env.SWAGGER_HOST}${API_DOC}/#/`);
    console.log(routes);
  }
}
