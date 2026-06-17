import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { WalletController } from '@/features/wallet/infra/http/wallet.controller';

/**
 * @swagger
 * /api/wallet/list-all:
 *   get:
 *     summary: Lista as carteiras ativas do usuário autenticado.
 *     tags: [Wallet]
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { description: Página de carteiras. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class ListWalletsRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'wallet/list-all';
  public readonly handler: HttpHandler;

  private constructor(
    controller: WalletController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.listAll;
  }

  public static create(
    controller: WalletController,
    middlewares: Middleware[] = [],
  ): ListWalletsRoute {
    return new ListWalletsRoute(controller, middlewares);
  }
}
