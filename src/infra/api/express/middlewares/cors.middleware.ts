import { Request, Response, NextFunction } from 'express';
import { Middleware } from './middleware';

export class CorsMiddleware implements Middleware {
  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      response.set('access-control-allow-origin', '*');
      response.set('access-control-allow-headers', '*');
      response.set('access-control-allow-methods', '*');
      next();
    };
  }
}
