import { HttpMethod, HttpMiddleware, Route } from '../route';
import { Request, Response, NextFunction } from 'express';
import { RegisterUserUseCase } from '@/usecases/auth/register.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

export class RegisterRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly registerService: RegisterUserUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    registerService: RegisterUserUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new RegisterRoute(
      'auth/register-account',
      HttpMethod.POST,
      registerService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { email, password, confirmPassword } = request.body;

        if (password !== confirmPassword)
          throw new ApiError(
            ERROR_MESSAGES.PASSWORD_IS_DIFERENT_CONFIRM_PASSWORD,
            400,
          );

        const userLogin = await this.registerService.execute({
          email,
          password,
        });
        response.status(201).json({ userLogin }).send();
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
