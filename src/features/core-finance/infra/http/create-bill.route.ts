import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';

/**
 * @swagger
 * /api/bill/create:
 *   post:
 *     summary: Cria uma despesa única (a vencer ou nascida paga, exigindo walletId).
 *     tags: [Bill]
 *     security: [{ sessionCookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, dueDate]
 *             properties:
 *               personId: { type: string }
 *               amount: { type: number }
 *               dueDate: { type: string }
 *               categoryDescriptionEnum: { type: string }
 *               isFixedCost: { type: boolean }
 *               period: { type: string }
 *               frequency: { type: number }
 *               paymentMethodDescriptionEnum:
 *                 $ref: '#/components/schemas/PaymentMethodDescriptionEnum'
 *               cardId: { type: string }
 *               paidAt: { type: string }
 *               paidAmount: { type: number }
 *               walletId: { type: string }
 *     responses:
 *       201: { $ref: '#/components/responses/CreateTransactionResultResponse' }
 *       400: { $ref: '#/components/responses/TransactionCreateBadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/WalletNotFound' }
 *       422: { $ref: '#/components/responses/TransactionInvalidFixedCost' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class CreateBillRoute implements Route {
  public readonly method: HttpMethod = 'post';
  public readonly path: string = 'bill/create';
  public readonly handler: HttpHandler;

  private constructor(
    controller: BillController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.create;
  }

  public static create(
    controller: BillController,
    middlewares: Middleware[] = [],
  ): CreateBillRoute {
    return new CreateBillRoute(controller, middlewares);
  }
}
