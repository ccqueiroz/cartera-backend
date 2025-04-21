import { HttpMethod, Route } from '../route';
import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '@/usecases/auth/login.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { HttpMiddleware } from '../../middlewares/middleware';
import { LoginValidation } from '../../schema_validations/Auth/auth.schema';
import { validate } from '@/packages/clients/class-validator';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login do usuário
 *     description: Esta rota permite o login do usuário no sistema.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@example.com
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AuthDTO'
 *       400:
 *         description: Parâmetros de entrada inválidos.
 *       401:
 *         description: Credenciais Inválidas.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */
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

        const requestDataValidation = new LoginValidation({ email, password });

        const errors = await validate(requestDataValidation);

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        const userLogin = await this.loginService.execute({ email, password });

        response.status(200).json({ ...userLogin });
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
