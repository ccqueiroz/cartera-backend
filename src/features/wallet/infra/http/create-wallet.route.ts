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
 *       201: { $ref: '#/components/responses/CreateWalletResultResponse' }
 *       400: { $ref: '#/components/responses/WalletCreateBadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
