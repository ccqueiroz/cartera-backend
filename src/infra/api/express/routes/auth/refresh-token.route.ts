import { HttpMethod, Route } from '../route';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { HttpMiddleware } from '../../middlewares/middleware';
import { RefreshTokenValidation } from '../../schema_validations/Auth/auth.schema';
import { runValidate } from '@/packages/clients/class-validator';
import { RefreshTokenUseCase } from '@/usecases/auth/refresh-token.usecase';

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Atualiza o token de acesso do usuário
 *     description: |
 *       Utiliza o refreshToken presente no cookie seguro para gerar um novo accessToken.
 *       O token atualizado será retornado no cookie session.
 *     tags:
 *       - Auth
 *     security:
 *       - refreshCookieAuth: []
 *     responses:
 *       200:
 *         description: Novo token de acesso gerado com sucesso.
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
 *                     userId:
 *                       type: string
 *                       example: "abc123"
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       example: "1//04iH3Gg1eIo..."
 *                     expirationTime:
 *                       type: number
 *                       description: Timestamp de expiração do novo token
 *                       example: 1720729280000
 *       400:
 *         description: Parâmetros inválidos ou ausência do refresh token.
 *       401:
 *         description: Token inválido ou sessão expirada.
 *       500:
 *         description: Erro interno no servidor.
 */

export class RefreshTokenRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly refreshToken: RefreshTokenUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    refreshToken: RefreshTokenUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new RefreshTokenRoute(
      'auth/refresh-token',
      HttpMethod.POST,
      refreshToken,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const refreshToken = request.cookies?.['refresh_session'];

        const errors = await runValidate<RefreshTokenValidation>(
          RefreshTokenValidation,
          {
            refreshToken,
          },
        );

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        const refreshTokenResponse = await this.refreshToken.execute({
          refreshToken,
        });

        response.cookie('session', refreshTokenResponse.data.accessToken, {
          httpOnly: false,
          path: '/',
          sameSite: 'lax',
          secure: true,
          maxAge: refreshTokenResponse.data.expirationTime ?? 0,
        });

        response.status(200).json({ ...refreshTokenResponse });
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
