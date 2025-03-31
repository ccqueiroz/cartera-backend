import { Request, Response, NextFunction } from 'express';
import { Middleware } from './middleware';

export class CorsMiddleware implements Middleware {
  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      response.set('access-control-allow-origin', '*');
      response.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, cf-connecting-ip',
      );
      response.setHeader('Access-Control-Expose-Headers', 'cf-connecting-ip');
      response.set('access-control-allow-methods', 'GET, POST, PUT, DELETE');
      response.set('access-control-max-age', '86400');
      next();
    };
  }
}
