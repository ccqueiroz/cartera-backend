import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { AuthController } from '@/features/auth/infra/http/auth.controller';

/**
 * @swagger
 * /api/auth/account:
 *   post:
 *     summary: Registra conta (email/senha) com auto-login.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *     responses:
 *       201:
 *         description: Conta e perfil criados; tokens no body e cookie `session` setado.
 *       400:
 *         description: E-mail inválido (INVALID_EMAIL) ou campo obrigatório ausente (VALIDATION_FAILED).
 *       409:
 *         description: E-mail já em uso (EMAIL_ALREADY_IN_USE).
 */
export class RegisterAccountRoute implements Route {
  public readonly method: HttpMethod = 'post';
  public readonly path: string = 'auth/account';
  public readonly handler: HttpHandler;

  private constructor(
    controller: AuthController,
    public readonly middlewares: Middleware[] = [],
  ) {
    // Schema validado no controller via runValidate (assertAuthInputValid).
    this.handler = controller.register;
  }

  public static create(
    controller: AuthController,
    middlewares: Middleware[] = [],
  ): RegisterAccountRoute {
    return new RegisterAccountRoute(controller, middlewares);
  }
}
