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
 *       202: { $ref: '#/components/responses/RecoverPasswordOutputResponse' }
 *       400: { $ref: '#/components/responses/AuthBadRequest' }
 *       401: { $ref: '#/components/responses/RecoverPasswordUnauthorized' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
