import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentStatusController } from '@/features/payment-status/infra/http/payment-status.controller';

/**
 * @swagger
 * /api/payment-status/list-by-enum/{descriptionEnum}:
 *   get:
 *     summary: Busca um status de pagamento do catálogo pelo code.
 *     tags: [PaymentStatus]
 *     parameters:
 *       - in: path
 *         name: descriptionEnum
 *         required: true
 *         schema: { $ref: '#/components/schemas/PaymentStatusDescriptionEnum' }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { $ref: '#/components/responses/PaymentStatusOutputResponse' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/PaymentStatusNotFound' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class GetPaymentStatusByEnumRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'payment-status/list-by-enum/:descriptionEnum';
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
