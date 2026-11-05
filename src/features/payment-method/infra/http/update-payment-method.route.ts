import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';

/**
 * @swagger
 * /api/payment-method/edit/{descriptionEnum}:
 *   put:
 *     summary: Atualiza apenas a description de uma forma de pagamento ativa.
 *     tags: [PaymentMethod]
 *     parameters:
 *       - in: path
 *         name: descriptionEnum
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description]
 *             properties:
 *               description: { type: string, maxLength: 60 }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { $ref: '#/components/responses/PaymentMethodOutputResponse' }
 *       400: { $ref: '#/components/responses/PaymentMethodBadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/PaymentMethodNotFound' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class UpdatePaymentMethodRoute implements Route {
  public readonly method: HttpMethod = 'put';
  public readonly path: string = 'payment-method/edit/:descriptionEnum';
  public readonly handler: HttpHandler;

  private constructor(
    controller: PaymentMethodController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.update;
  }

  public static create(
    controller: PaymentMethodController,
    middlewares: Middleware[] = [],
  ): UpdatePaymentMethodRoute {
    return new UpdatePaymentMethodRoute(controller, middlewares);
  }
}
