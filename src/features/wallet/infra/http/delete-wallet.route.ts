import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { WalletController } from '@/features/wallet/infra/http/wallet.controller';

/**
 * @swagger
 * /api/wallet/delete/{id}:
 *   delete:
 *     summary: Remove (soft-delete) uma carteira; saldo ≠ 0 exige force.
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: force
 *         schema: { type: boolean }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       204: { description: Carteira removida (idempotente). }
 *       401: { description: Sessão ausente ou inválida. }
 *       422: { description: Saldo ≠ 0 sem force. }
 */
export class DeleteWalletRoute implements Route {
  public readonly method: HttpMethod = 'delete';
  public readonly path: string = 'wallet/delete/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: WalletController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.remove;
  }

  public static create(
    controller: WalletController,
    middlewares: Middleware[] = [],
  ): DeleteWalletRoute {
    return new DeleteWalletRoute(controller, middlewares);
  }
}
