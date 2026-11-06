import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { AuthController } from '@/features/auth/infra/http/auth.controller';

/**
 * @swagger
 * /api/auth/session:
 *   post:
 *     summary: Login (cria sessão) com email/senha.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { $ref: '#/components/responses/AuthSessionResponse' }
 *       400: { $ref: '#/components/responses/AuthBadRequest' }
 *       401: { $ref: '#/components/responses/LoginUnauthorized' }
 *       403: { $ref: '#/components/responses/LoginForbidden' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class LoginRoute implements Route {
  public readonly method: HttpMethod = 'post';
  public readonly path: string = 'auth/session';
  public readonly handler: HttpHandler;

  private constructor(
    controller: AuthController,
    public readonly middlewares: Middleware[] = [],
  ) {
    // Schema validado no controller via runValidate (assertAuthInputValid).
    this.handler = controller.login;
  }

  public static create(
    controller: AuthController,
    middlewares: Middleware[] = [],
  ): LoginRoute {
    return new LoginRoute(controller, middlewares);
  }
}
