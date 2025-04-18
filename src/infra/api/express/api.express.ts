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
export class ApiExpress implements Api {
  private static instance: ApiExpress;
  private app: Express;
  private logger: LoggerGateway;

  private constructor(
    routes: Array<Route>,
    globalMiddlewares: Array<Middleware>,
    errorMiddleware: ErrorMiddleware,
    logger: LoggerGateway,
  ) {
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
  ) {
    if (!ApiExpress.instance) {
      ApiExpress.instance = new ApiExpress(
        routes,
        globalMiddlewares,
        errorMiddleware,
        logger,
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

  public start(port: number) {
    this.app.listen(port, () => {
      this.logger.info(`Server running on port ${port}`);
      this.listRoutes(port);
    });
  }

  private listRoutes(port: number) {
    const routes = this.app._router.stack
      .filter((route: any) => route.route)
      .map((route: any) => {
        return {
          path: route.route.path,
          method: route.route.stack[0].method,
        };
      });
    this.logger.info(`Swagger UI ->  http://localhost:${port}${API_DOC}/#/`);
    console.log(routes);
  }
}
