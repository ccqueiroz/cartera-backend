import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';

/**
 * @swagger
 * /api/payment-method/delete/{descriptionEnum}:
 *   delete:
 *     summary: Soft-delete da forma de pagamento ativa identificada por descriptionEnum.
 *     tags: [PaymentMethod]
 *     parameters:
 *       - in: path
 *         name: descriptionEnum
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       204: { description: "Forma de pagamento soft-deletada." }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/PaymentMethodNotFound' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class DeletePaymentMethodRoute implements Route {
  public readonly method: HttpMethod = 'delete';
  public readonly path: string = 'payment-method/delete/:descriptionEnum';
  public readonly handler: HttpHandler;

  private constructor(
    controller: PaymentMethodController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.remove;
  }

  public static create(
    controller: PaymentMethodController,
    middlewares: Middleware[] = [],
  ): DeletePaymentMethodRoute {
    return new DeletePaymentMethodRoute(controller, middlewares);
  }
}
