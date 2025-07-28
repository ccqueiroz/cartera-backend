import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';
import { Middleware } from './middleware';

export class CookiesMiddleware implements Middleware {
  private readonly parser = cookieParser();
  public getHandler() {
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
