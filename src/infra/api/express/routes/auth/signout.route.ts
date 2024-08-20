import { SignoutUseCase } from '@/usecases/auth/signout.usecase';
import { HttpMethod, HttpMiddleware, Route } from '../route';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
/**
 * @swagger
 * /api/auth/signout:
 *   get:
 *     summary: Deslogar do sistema
 *     description: Esta rota permite deslogar o usuário do sistema.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: false
 *       content: {}
 *     responses:
 *       204:
 *         description: Usuário deslogado com sucesso.
 *         content: {}
 *       500:
 *         description: Erro interno no servidor.
 */
export class SignoutRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly signoutService: SignoutUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    signoutService: SignoutUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new SignoutRoute(
      'auth/signout',
      HttpMethod.GET,
      signoutService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        await this.signoutService.execute();
        response.status(204);
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
