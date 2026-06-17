import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { WalletController } from '@/features/wallet/infra/http/wallet.controller';

/**
 * @swagger
 * /api/wallet/create:
 *   post:
 *     summary: Cria uma carteira do usuário autenticado.
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               balance: { type: number }
 *               overdraftLimit: { type: number }
 *               overdraftMonthlyRate: { type: number }
 *               overdraftGraceDays: { type: integer }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       201: { description: Carteira criada (com warnings se saldo negativo). }
 *       400: { description: Payload inválido. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class CreateWalletRoute implements Route {
  public readonly method: HttpMethod = 'post';
  public readonly path: string = 'wallet/create';
  public readonly handler: HttpHandler;

  private constructor(
    controller: WalletController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.create;
  }

  public static create(
    controller: WalletController,
    middlewares: Middleware[] = [],
  ): CreateWalletRoute {
    return new CreateWalletRoute(controller, middlewares);
  }
}
