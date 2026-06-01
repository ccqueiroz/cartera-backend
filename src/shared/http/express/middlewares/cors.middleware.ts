import { Request, Response, NextFunction } from 'express';
import { HttpMiddleware, Middleware } from '@/shared/http/middleware';

export class CorsMiddleware implements Middleware {
  private readonly allowedOrigins: string[];

  private constructor(allowedOrigins: string[]) {
    this.allowedOrigins = allowedOrigins;
  }

  public static create(
    allowedOrigins: string[] = (process.env.CORS_ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ): CorsMiddleware {
    return new CorsMiddleware(allowedOrigins);
  }

  public getHandler(): HttpMiddleware {
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
