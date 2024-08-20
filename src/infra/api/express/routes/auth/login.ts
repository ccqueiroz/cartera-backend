import { HttpMethod, HttpMiddleware, Route } from '../route';
import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '@/usecases/auth/login.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

export class LoginRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly loginService: LoginUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    loginService: LoginUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new LoginRoute(
      'auth/login',
      HttpMethod.POST,
      loginService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { email, password } = request.body;

        const userLogin = await this.loginService.execute({ email, password });

        response.status(201).json({ ...userLogin });
      } catch (error) {
        next(
          error instanceof ApiError
            ? error
            : new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500),
        );
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
