import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { TransferController } from '@/features/transfer/infra/http/transfer.controller';

/**
 * @swagger
 * /api/transfer/create:
 *   post:
 *     summary: Transfere um valor entre duas carteiras do usuário autenticado (movimento neutro).
 *     tags: [Transfer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fromWalletId, toWalletId, amount, paymentMethodDescriptionEnum]
 *             properties:
 *               fromWalletId: { type: string }
 *               toWalletId: { type: string }
 *               amount: { type: number }
 *               paymentMethodDescriptionEnum: { type: string }
 *               transferDate: { type: string, example: '2026-06-17' }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       201: { $ref: '#/components/responses/CreateTransferResultResponse' }
 *       400: { $ref: '#/components/responses/TransferCreateBadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/WalletNotFound' }
 *       422: { $ref: '#/components/responses/TransferPaymentMethodInactive' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class CreateTransferRoute implements Route {
  public readonly method: HttpMethod = 'post';
  public readonly path: string = 'transfer/create';
  public readonly handler: HttpHandler;

  private constructor(
    controller: TransferController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.create;
  }

  public static create(
    controller: TransferController,
    middlewares: Middleware[] = [],
  ): CreateTransferRoute {
    return new CreateTransferRoute(controller, middlewares);
  }
}
