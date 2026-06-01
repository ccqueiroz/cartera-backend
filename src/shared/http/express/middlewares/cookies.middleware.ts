import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';
import { HttpMiddleware, Middleware } from '@/shared/http/middleware';

export class CookiesMiddleware implements Middleware {
  private readonly parser = cookieParser();

  public getHandler(): HttpMiddleware {
    return async (request: Request, response: Response, next: NextFunction) => {
      this.parser(request, response, (err) => {
        if (err) {
          next(err);
        } else {
          next();
        }
      });
    };
  }
}
