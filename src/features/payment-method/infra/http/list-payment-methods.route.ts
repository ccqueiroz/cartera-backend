import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';

/**
 * @swagger
 * /api/payment-method/list-all:
 *   get:
 *     summary: Lista as formas de pagamento ativas.
 *     tags: [PaymentMethod]
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { $ref: '#/components/responses/PaymentMethodListResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class ListPaymentMethodsRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'payment-method/list-all';
  public readonly handler: HttpHandler;

  private constructor(
    controller: PaymentMethodController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.listAll;
  }

  public static create(
    controller: PaymentMethodController,
    middlewares: Middleware[] = [],
  ): ListPaymentMethodsRoute {
    return new ListPaymentMethodsRoute(controller, middlewares);
  }
}
