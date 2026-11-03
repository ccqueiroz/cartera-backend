import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';

/**
 * @swagger
 * /api/bill/create-installment:
 *   post:
 *     summary: Cria uma despesa parcelada (entrada paga exige walletId).
 *     tags: [Bill]
 *     security: [{ sessionCookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, dueDate, installments]
 *             properties:
 *               personId: { type: string }
 *               amount: { type: number }
 *               dueDate: { type: string }
 *               categoryDescriptionEnum: { type: string }
 *               isFixedCost: { type: boolean }
 *               period: { type: string }
 *               frequency: { type: number }
 *               installments: { type: array, items: { type: object } }
 *               entry: { type: object }
 *     responses:
 *       201: { description: OK. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class CreateInstallmentBillRoute implements Route {
  public readonly method: HttpMethod = 'post';
  public readonly path: string = 'bill/create-installment';
  public readonly handler: HttpHandler;

  private constructor(
    controller: BillController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.createInstallment;
  }

  public static create(
    controller: BillController,
    middlewares: Middleware[] = [],
  ): CreateInstallmentBillRoute {
    return new CreateInstallmentBillRoute(controller, middlewares);
  }
}
