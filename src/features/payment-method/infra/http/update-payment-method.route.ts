import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';

/**
 * @swagger
 * /api/payment-method/{id}:
 *   put:
 *     summary: Atualiza apenas a description de uma forma de pagamento ativa.
 *     tags: [PaymentMethod]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description]
 *             properties:
 *               description: { type: string, maxLength: 60 }
 *     responses:
 *       200:
 *         description: Forma de pagamento atualizada.
 *       400:
 *         description: Payload inválido.
 *       404:
 *         description: Forma de pagamento não encontrada.
 *       409:
 *         description: Forma de pagamento soft-deleted (não pode ser alterada).
 */
export class UpdatePaymentMethodRoute implements Route {
  public readonly method: HttpMethod = 'put';
  public readonly path: string = 'payment-method/:id';
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
