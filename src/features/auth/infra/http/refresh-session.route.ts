import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { AuthController } from '@/features/auth/infra/http/auth.controller';

/**
 * @swagger
 * /api/auth/session:
 *   put:
 *     summary: Renova a sessão trocando o refresh token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Novos tokens no body (expirationTime ISO-8601) e cookie `session` atualizado.
 *       400:
 *         description: Refresh token ausente (VALIDATION_FAILED).
 *       401:
 *         description: Refresh token inválido, expirado ou revogado (INVALID_TOKEN) — exige relogin.
 */
export class RefreshSessionRoute implements Route {
  public readonly method: HttpMethod = 'put';
  public readonly path: string = 'auth/session';
  public readonly handler: HttpHandler;

  private constructor(
    controller: AuthController,
    public readonly middlewares: Middleware[] = [],
  ) {
    // Schema validado no controller via runValidate (assertAuthInputValid).
    this.handler = controller.refresh;
  }

  public static create(
    controller: AuthController,
    middlewares: Middleware[] = [],
  ): RefreshSessionRoute {
    return new RefreshSessionRoute(controller, middlewares);
  }
}
