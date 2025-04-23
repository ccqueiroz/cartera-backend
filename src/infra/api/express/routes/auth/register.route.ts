import { HttpMethod, Route } from '../route';
import { Request, Response, NextFunction } from 'express';
import { RegisterUserUseCase } from '@/usecases/auth/register.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { HttpMiddleware } from '../../middlewares/middleware';
import { RegisterValidation } from '../../schema_validations/Auth/auth.schema';
import { runValidate } from '@/packages/clients/class-validator';

/**
 * @swagger
 * /api/auth/register-account:
 *   post:
 *     summary: Cria um novo usuário
 *     description: Esta rota permite a criação de um novo usuário no sistema.
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
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@example.com
 *               password:
 *                 type: string
 *                 example: senha123
 *               confirmPassword:
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
 *         description: O e-mail fornecido já está em uso por outra conta. | A senha e a confirmação de senha não conferem | Parâmetros de entrada inválidos.
 *       401:
 *         description: Credenciais Inválidas.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */
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
        const { email, password, confirmPassword, firstName, lastName } =
          request.body;

        if (!email || !password || !confirmPassword || !firstName || !lastName)
          throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);

        const errors = await runValidate<RegisterValidation>(
          RegisterValidation,
          {
            email,
            password,
            confirmPassword,
            firstName,
            lastName,
          },
        );

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        if (password !== confirmPassword)
          throw new ApiError(
            ERROR_MESSAGES.PASSWORD_IS_DIFERENT_CONFIRM_PASSWORD,
            400,
          );

        const userLogin = await this.registerService.execute({
          email,
          password,
          firstName,
          lastName,
        });

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
