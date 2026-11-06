import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';

/**
 * @swagger
 * /api/bill/global-settlement/{id}:
 *   patch:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     summary: Quitacao global (debito total + um movimento por folha).
 *     tags: [Bill]
 *     security: [{ sessionCookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [walletId, paymentDate, paymentMethodDescriptionEnum]
 *             properties:
 *               walletId: { type: string }
 *               paymentDate: { type: string }
 *               paymentMethodDescriptionEnum:
 *                 $ref: '#/components/schemas/PaymentMethodDescriptionEnum'
 *               selection: { type: array, items: { type: string } }
 *               valorPago: { type: number }
 *     responses:
 *       200: { $ref: '#/components/responses/SettleTransactionResultResponse' }
 *       400: { $ref: '#/components/responses/TransactionSettleBadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/TransactionOrWalletNotFound' }
 *       422: { $ref: '#/components/responses/TransactionAlreadyPaid' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class GlobalSettleBillRoute implements Route {
  public readonly method: HttpMethod = 'patch';
  public readonly path: string = 'bill/global-settlement/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: BillController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.globalSettlement;
  }

  public static create(
    controller: BillController,
    middlewares: Middleware[] = [],
  ): GlobalSettleBillRoute {
    return new GlobalSettleBillRoute(controller, middlewares);
  }
}
