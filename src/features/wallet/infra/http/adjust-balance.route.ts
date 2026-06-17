import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { WalletController } from '@/features/wallet/infra/http/wallet.controller';

/**
 * @swagger
 * /api/wallet/adjust-balance/{id}:
 *   patch:
 *     summary: Ajuste manual de saldo (depósito/saque) com movimento ADJUST.
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [operation, amount]
 *             properties:
 *               operation: { type: string, enum: [DEPOSIT, WITHDRAW] }
 *               amount: { type: number }
 *               occurredAt: { type: string }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { description: Saldo ajustado (wallet + movimentos + warnings). }
 *       400: { description: Valor inválido. }
 *       401: { description: Sessão ausente ou inválida. }
 *       404: { description: Carteira não encontrada. }
 *       409: { description: Carteira removida. }
 */
export class AdjustBalanceRoute implements Route {
  public readonly method: HttpMethod = 'patch';
  public readonly path: string = 'wallet/adjust-balance/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: WalletController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.adjustBalance;
  }

  public static create(
    controller: WalletController,
    middlewares: Middleware[] = [],
  ): AdjustBalanceRoute {
    return new AdjustBalanceRoute(controller, middlewares);
  }
}
