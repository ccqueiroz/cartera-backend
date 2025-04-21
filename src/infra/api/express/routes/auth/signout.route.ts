import { SignoutUseCase } from '@/usecases/auth/signout.usecase';
import { HttpMethod, Route } from '../route';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { HttpMiddleware } from '../../middlewares/middleware';
import { validate } from '@/packages/clients/class-validator';
import { SignoutValidation } from '../../schema_validations/Auth/auth.schema';

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
 *       400:
 *         description: Parâmetros de entrada inválidos.
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
      const user_auth = request.user_auth;

      try {
        if (!user_auth?.userId)
          new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);

        const requestDataValidation = new SignoutValidation({
          userId: user_auth!.userId,
        });

        const errors = await validate(requestDataValidation);

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        await this.signoutService.execute({
          userId: String(user_auth?.userId),
        });

        response.status(204).send();
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
