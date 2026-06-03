import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';

/**
 * @swagger
 * /api/payment-method/{descriptionEnum}:
 *   delete:
 *     summary: Soft-delete da forma de pagamento ativa identificada por descriptionEnum.
 *     tags: [PaymentMethod]
 *     parameters:
 *       - in: path
 *         name: descriptionEnum
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Forma de pagamento soft-deletada.
 *       400:
 *         description: descriptionEnum fora do conjunto fechado.
 *       404:
 *         description: Não existe forma de pagamento ativa (inexistente ou já soft-deletada).
 */
export class DeletePaymentMethodRoute implements Route {
  public readonly method: HttpMethod = 'delete';
  public readonly path: string = 'payment-method/:descriptionEnum';
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
