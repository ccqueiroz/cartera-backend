import { NextFunction, Request, Response } from 'express';
import { HttpMethod, MapRoutes, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';

class PingRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create() {
    return new PingRoute('ping', HttpMethod.GET);
  }

  public getHandler() {
    return async (
      request: Request,
      response: Response,
      _next: NextFunction,
    ) => {
      try {
        response.status(200).send('pong');
      } catch (error) {
        response.status(400).send('outch, pong down');
      }
    };
  }

  public getPath(): string {
    return this.path;
  }

  public getMethod(): HttpMethod {
    return this.method;
  }

  public getMiddlewares() {
    return this.middlewares;
  }
}

export class PingRoutes implements MapRoutes {
  private constructor(private readonly routes: Array<Route> = []) {
    this.joinRoutes();
  }

  public static create() {
    return new PingRoutes();
  }

  private factoryPing() {
    const getPingRoute = PingRoute.create();
    this.routes.push(getPingRoute);
  }

  private joinRoutes() {
    this.factoryPing();
  }

  public execute() {
    return this.routes;
  }
}
