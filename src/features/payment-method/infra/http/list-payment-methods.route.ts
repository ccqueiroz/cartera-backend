import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';

/**
 * @swagger
 * /api/payment-method:
 *   get:
 *     summary: Lista as formas de pagamento ativas.
 *     tags: [PaymentMethod]
 *     responses:
 *       200:
 *         description: Lista de formas de pagamento ativas (pode ser vazia).
 */
export class ListPaymentMethodsRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'payment-method';
  public readonly handler: HttpHandler;

  private constructor(
    controller: PaymentMethodController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.list;
  }

  public static create(
    controller: PaymentMethodController,
    middlewares: Middleware[] = [],
  ): ListPaymentMethodsRoute {
    return new ListPaymentMethodsRoute(controller, middlewares);
  }
}
