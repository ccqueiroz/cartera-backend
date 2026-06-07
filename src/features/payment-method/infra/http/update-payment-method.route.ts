import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';

/**
 * @swagger
 * /api/payment-method/{descriptionEnum}:
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
 *       200:
 *         description: Forma de pagamento atualizada.
 *       400:
 *         description: Payload inválido ou descriptionEnum fora do conjunto fechado.
 *       401:
 *         description: Sessão ausente ou inválida.
 *       404:
 *         description: Não existe forma de pagamento ativa para o descriptionEnum.
 */
export class UpdatePaymentMethodRoute implements Route {
  public readonly method: HttpMethod = 'put';
  public readonly path: string = 'payment-method/:descriptionEnum';
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
