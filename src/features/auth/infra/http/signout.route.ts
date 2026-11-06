import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { AuthController } from '@/features/auth/infra/http/auth.controller';

/**
 * @swagger
 * /api/auth/session:
 *   delete:
 *     summary: Signout — revoga todos os refresh tokens do usuário (todos os devices).
 *     tags: [Auth]
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       204: { description: "Sessão encerrada; cookie `session` expirado." }
 *       401: { $ref: '#/components/responses/SignoutUnauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
