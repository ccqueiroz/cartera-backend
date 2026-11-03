import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';

/**
 * @swagger
 * /api/bill/settle/{id}:
 *   patch:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     summary: Paga uma parcela (liquidacao atomica com a wallet).
 *     tags: [Bill]
 *     security: [{ sessionCookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [walletId, paidAmount, paymentDate, paymentMethodDescriptionEnum]
 *             properties:
 *               walletId: { type: string }
 *               paidAmount: { type: number }
 *               paymentDate: { type: string }
 *               paymentMethodDescriptionEnum:
 *                 $ref: '#/components/schemas/PaymentMethodDescriptionEnum'
 *     responses:
 *       200: { description: OK. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class SettleBillRoute implements Route {
  public readonly method: HttpMethod = 'patch';
  public readonly path: string = 'bill/settle/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: BillController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.settle;
  }

  public static create(
    controller: BillController,
    middlewares: Middleware[] = [],
  ): SettleBillRoute {
    return new SettleBillRoute(controller, middlewares);
  }
}
