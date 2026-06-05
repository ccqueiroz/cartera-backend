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
 *       200:
 *         description: Tokens no body (expirationTime ISO-8601) e cookie `session` setado.
 *       400:
 *         description: E-mail inválido (INVALID_EMAIL) ou campo ausente (VALIDATION_FAILED).
 *       401:
 *         description: Credenciais inválidas (INVALID_CREDENTIALS) — e-mail e senha errados são indistinguíveis.
 *       403:
 *         description: Conta encerrada (ACCOUNT_DELETED) ou suspensa (USER_DISABLED).
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
