import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';

/**
 * @swagger
 * /api/payment-method/list-by-enum/{descriptionEnum}:
 *   get:
 *     summary: Busca a forma de pagamento por descriptionEnum (ativa, senão soft-deleted mais recente).
 *     tags: [PaymentMethod]
 *     parameters:
 *       - in: path
 *         name: descriptionEnum
 *         required: true
 *         schema: { $ref: '#/components/schemas/PaymentMethodDescriptionEnum' }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { $ref: '#/components/responses/PaymentMethodOutputResponse' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/PaymentMethodNotFound' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class GetPaymentMethodByEnumRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'payment-method/list-by-enum/:descriptionEnum';
  public readonly handler: HttpHandler;

  private constructor(
    controller: PaymentMethodController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.getByEnum;
  }

  public static create(
    controller: PaymentMethodController,
    middlewares: Middleware[] = [],
  ): GetPaymentMethodByEnumRoute {
    return new GetPaymentMethodByEnumRoute(controller, middlewares);
  }
}
