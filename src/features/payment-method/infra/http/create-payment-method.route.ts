import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';

/**
 * @swagger
 * /api/payment-method:
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
 *               descriptionEnum:
 *                 type: string
 *                 enum: [DEBIT_CARD, CREDIT_CARD, BANK_SLIP, BANK_DEPOSIT, BANK_TRANSFER, AUTOMATIC_DEBIT, BOOKLET, CASH, CHECK, PROMISSORY, FINANCING, MEAL_VOUCHER, FOOD_VOUCHER, PIX, CRYPTOCURRENCY, DIGITAL_WALLET]
 *     responses:
 *       201:
 *         description: Forma de pagamento criada.
 *       400:
 *         description: Payload inválido.
 *       409:
 *         description: Já existe forma de pagamento ativa para o descriptionEnum.
 */
export class CreatePaymentMethodRoute implements Route {
  public readonly method: HttpMethod = 'post';
  public readonly path: string = 'payment-method';
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
