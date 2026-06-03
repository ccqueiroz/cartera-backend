import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';

/**
 * @swagger
 * /api/payment-method/description/{descriptionEnum}:
 *   get:
 *     summary: Busca a forma de pagamento por descriptionEnum (ativa, senão soft-deleted mais recente).
 *     tags: [PaymentMethod]
 *     parameters:
 *       - in: path
 *         name: descriptionEnum
 *         required: true
 *         schema:
 *           type: string
 *           enum: [DEBIT_CARD, CREDIT_CARD, BANK_SLIP, BANK_DEPOSIT, BANK_TRANSFER, AUTOMATIC_DEBIT, BOOKLET, CASH, CHECK, PROMISSORY, FINANCING, MEAL_VOUCHER, FOOD_VOUCHER, PIX, CRYPTOCURRENCY, DIGITAL_WALLET]
 *     responses:
 *       200:
 *         description: Forma de pagamento (ativa ou soft-deleted mais recente).
 *       400:
 *         description: descriptionEnum fora do conjunto fechado.
 *       404:
 *         description: Nenhuma forma de pagamento do tipo existe.
 */
export class GetPaymentMethodByEnumRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'payment-method/description/:descriptionEnum';
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
