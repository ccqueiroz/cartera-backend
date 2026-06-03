import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentStatusController } from '@/features/payment-status/infra/http/payment-status.controller';

/**
 * @swagger
 * /api/payment-status/list-all:
 *   get:
 *     summary: Lista o catálogo de status de pagamento.
 *     tags: [PaymentStatus]
 *     responses:
 *       200:
 *         description: Lista de status de pagamento semeados (pode ser vazia).
 */
export class ListPaymentStatusesRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'payment-status/list-all';
  public readonly handler: HttpHandler;

  private constructor(
    controller: PaymentStatusController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.list;
  }

  public static create(
    controller: PaymentStatusController,
    middlewares: Middleware[] = [],
  ): ListPaymentStatusesRoute {
    return new ListPaymentStatusesRoute(controller, middlewares);
  }
}
