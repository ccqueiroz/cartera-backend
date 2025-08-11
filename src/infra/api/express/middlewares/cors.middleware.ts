import { Request, Response, NextFunction } from 'express';
import { Middleware } from './middleware';

export class CorsMiddleware implements Middleware {
  private allowedOrigins = ['http://localhost:3000', 'http://localhost:8889'];

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      const origin = request.headers.origin;

      if (origin && this.allowedOrigins.includes(origin)) {
        response.setHeader('Access-Control-Allow-Origin', origin);
      }

      response.set('Access-Control-Allow-Credentials', 'true');
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
