import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { WalletController } from '@/features/wallet/infra/http/wallet.controller';

/**
 * @swagger
 * /api/wallet/edit/{id}:
 *   put:
 *     summary: Edita nome e config de cheque-especial da carteira (saldo fora da whitelist).
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               overdraftLimit: { type: number }
 *               overdraftMonthlyRate: { type: number }
 *               overdraftGraceDays: { type: integer }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { description: Carteira atualizada. }
 *       401: { description: Sessão ausente ou inválida. }
 *       404: { description: Carteira não encontrada. }
 *       409: { description: Carteira removida. }
 */
export class EditWalletRoute implements Route {
  public readonly method: HttpMethod = 'put';
  public readonly path: string = 'wallet/edit/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: WalletController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.edit;
  }

  public static create(
    controller: WalletController,
    middlewares: Middleware[] = [],
  ): EditWalletRoute {
    return new EditWalletRoute(controller, middlewares);
  }
}
