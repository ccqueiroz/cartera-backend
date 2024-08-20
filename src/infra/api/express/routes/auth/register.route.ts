import { HttpMethod, HttpMiddleware, Route } from '../route';
import { Request, Response, NextFunction } from 'express';
import { RegisterUserUseCase } from '@/usecases/auth/register.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
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
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: usuario@example.com
 *                     userId:
 *                       type: string
 *                       example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ0MjY5YTE3MzBlNTA3MTllNmIxNjA2ZTQyYzNhYjMyYjEyODA0NDkiLCJ0eXAiOiJKV1QifQ...
 *                     refreshToken:
 *                       type: string
 *                       example: AMf-vBzHWb5CVzqi280Ai5zLoOyVzK-8QiQSsvfBBZ8Sp1yuiOr5ioekiz5y27v_H1rI8KgM7jWY7um7kFrjjme3jkFx6pWlReWS...
 *                     expirationTime:
 *                       type: integer
 *                       example: 1724148470215
 *                     lastLoginAt:
 *                       type: string
 *                       example: 1724144869975
 *       400:
 *         description: O e-mail fornecido já está em uso por outra conta. | A senha e a confirmação de senha não conferem.
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
