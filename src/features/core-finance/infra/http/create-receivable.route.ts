import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/create:
 *   post:
 *     summary: Cria uma receita única (a receber ou nascida recebida, exigindo walletId).
 *     tags: [Receivable]
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
export class CreateReceivableRoute implements Route {
  public readonly method: HttpMethod = 'post';
  public readonly path: string = 'receivable/create';
  public readonly handler: HttpHandler;

  private constructor(
    controller: ReceivableController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.create;
  }

  public static create(
    controller: ReceivableController,
    middlewares: Middleware[] = [],
  ): CreateReceivableRoute {
    return new CreateReceivableRoute(controller, middlewares);
  }
}
