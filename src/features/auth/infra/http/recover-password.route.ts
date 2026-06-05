import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { AuthController } from '@/features/auth/infra/http/auth.controller';

/**
 * @swagger
 * /api/auth/password-recovery:
 *   post:
 *     summary: Solicita recuperação de senha (resposta genérica anti-enumeração).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       202:
 *         description: Resposta genérica idêntica exista a conta ou não — nunca vaza existência.
 *       400:
 *         description: E-mail malformado (INVALID_EMAIL).
 */
export class RecoverPasswordRoute implements Route {
  public readonly method: HttpMethod = 'post';
  public readonly path: string = 'auth/password-recovery';
  public readonly handler: HttpHandler;

  private constructor(
    controller: AuthController,
    public readonly middlewares: Middleware[] = [],
  ) {
    // Schema validado no controller via runValidate (assertAuthInputValid).
    this.handler = controller.recoverPassword;
  }

  public static create(
    controller: AuthController,
    middlewares: Middleware[] = [],
  ): RecoverPasswordRoute {
    return new RecoverPasswordRoute(controller, middlewares);
  }
}
