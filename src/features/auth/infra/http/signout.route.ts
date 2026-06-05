import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { AuthController } from '@/features/auth/infra/http/auth.controller';

/**
 * @swagger
 * /api/auth/session:
 *   delete:
 *     summary: Signout — revoga todos os refresh tokens do usuário (todos os devices).
 *     tags: [Auth]
 *     responses:
 *       204:
 *         description: Sessão encerrada; cookie `session` expirado.
 *       401:
 *         description: Sessão ausente, inválida (INVALID_TOKEN) ou expirada (TOKEN_EXPIRED).
 *       403:
 *         description: Conta desativada (USER_DISABLED).
 */
export class SignoutRoute implements Route {
  public readonly method: HttpMethod = 'delete';
  public readonly path: string = 'auth/session';
  public readonly handler: HttpHandler;

  private constructor(
    controller: AuthController,
    public readonly middlewares: Middleware[],
  ) {
    this.handler = controller.signout;
  }

  public static create(
    controller: AuthController,
    middlewares: Middleware[],
  ): SignoutRoute {
    return new SignoutRoute(controller, middlewares);
  }
}
