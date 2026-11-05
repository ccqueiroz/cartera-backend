import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';

/**
 * @swagger
 * /api/payment-method/create:
 *   post:
 *     summary: Cria uma forma de pagamento.
 *     tags: [PaymentMethod]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, descriptionEnum]
 *             properties:
 *               description: { type: string, maxLength: 60 }
 *               descriptionEnum: { $ref: '#/components/schemas/PaymentMethodDescriptionEnum' }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       201: { $ref: '#/components/responses/PaymentMethodOutputResponse' }
 *       400: { $ref: '#/components/responses/PaymentMethodBadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       409: { $ref: '#/components/responses/PaymentMethodAlreadyExists' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class CreatePaymentMethodRoute implements Route {
  public readonly method: HttpMethod = 'post';
  public readonly path: string = 'payment-method/create';
  public readonly handler: HttpHandler;

  private constructor(
    controller: PaymentMethodController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.create;
  }

  public static create(
    controller: PaymentMethodController,
    middlewares: Middleware[] = [],
  ): CreatePaymentMethodRoute {
    return new CreatePaymentMethodRoute(controller, middlewares);
  }
}
