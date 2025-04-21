import { RecoveryPasswordUseCase } from '@/usecases/auth/recovery-password.usecase';
import { HttpMethod, Route } from '../route';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { HttpMiddleware } from '../../middlewares/middleware';
import { RecoveryPasswordValidation } from '../../schema_validations/Auth/auth.schema';
import { validate } from '@/packages/clients/class-validator';

/**
 * @swagger
 * /api/auth/recovery-password:
 *   post:
 *     summary: Recuperar senha
 *     description: Esta rota permite a recuperação de senha do usuário no sistema.
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
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@example.com
 *     responses:
 *       204:
 *         description: E-mail enviado com sucesso.
 *         content: {}
 *       400:
 *         description: Parâmetros de entrada inválidos.
 *       401:
 *         description: Credenciais Inválidas.
 *       404:
 *         description: Usuário não encontrado.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */
export class RecoveryPasswordRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly recoveryPasswordService: RecoveryPasswordUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    recoveryPasswordService: RecoveryPasswordUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new RecoveryPasswordRoute(
      'auth/recovery-password',
      HttpMethod.POST,
      recoveryPasswordService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { email } = request.body;

        const requestDataValidation = new RecoveryPasswordValidation({
          email,
        });

        const errors = await validate(requestDataValidation);

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        await this.recoveryPasswordService.execute({ email });
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
