import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';

/**
 * @swagger
 * /api/payment-method/{id}:
 *   delete:
 *     summary: Soft-delete de uma forma de pagamento (idempotente).
 *     tags: [PaymentMethod]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Forma de pagamento soft-deleted (idempotente).
 *       404:
 *         description: Forma de pagamento não encontrada.
 */
export class DeletePaymentMethodRoute implements Route {
  public readonly method: HttpMethod = 'delete';
  public readonly path: string = 'payment-method/:id';
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
