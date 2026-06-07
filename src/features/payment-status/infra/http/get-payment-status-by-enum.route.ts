import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentStatusController } from '@/features/payment-status/infra/http/payment-status.controller';

/**
 * @swagger
 * /api/payment-status/description/{descriptionEnum}:
 *   get:
 *     summary: Busca um status de pagamento do catálogo pelo code.
 *     tags: [PaymentStatus]
 *     parameters:
 *       - in: path
 *         name: descriptionEnum
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PAID, RECEIVED, TO_PAY, TO_RECEIVE, DUE_SOON, DUE_DAY, OVERDUE, IN_PROGRESS]
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200:
 *         description: Status de pagamento do catálogo.
 *       400:
 *         description: descriptionEnum fora do conjunto fechado.
 *       401:
 *         description: Sessão ausente ou inválida.
 *       404:
 *         description: Nenhum status semeado para o code informado.
 */
export class GetPaymentStatusByEnumRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'payment-status/description/:descriptionEnum';
  public readonly handler: HttpHandler;

  private constructor(
    controller: PaymentStatusController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.getByEnum;
  }

  public static create(
    controller: PaymentStatusController,
    middlewares: Middleware[] = [],
  ): GetPaymentStatusByEnumRoute {
    return new GetPaymentStatusByEnumRoute(controller, middlewares);
  }
}
