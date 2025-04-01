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
export class ApiExpress implements Api {
  private static instance: ApiExpress;
  private app: Express;

  private constructor(
    routes: Array<Route>,
    globalMiddlewares: Array<Middleware>,
    errorMiddleware: ErrorMiddleware,
  ) {
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
  ) {
    if (!ApiExpress.instance) {
      ApiExpress.instance = new ApiExpress(
        routes,
        globalMiddlewares,
        errorMiddleware,
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
      console.log(`Server running on port ${port}`);
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

    console.log('Swagger UI -> ', `http://localhost:${port}${API_DOC}/#/`);
    console.log(routes);
  }
}
