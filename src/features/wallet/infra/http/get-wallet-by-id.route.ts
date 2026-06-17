import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { WalletController } from '@/features/wallet/infra/http/wallet.controller';

/**
 * @swagger
 * /api/wallet/list-by-id/{id}:
 *   get:
 *     summary: Obtém uma carteira do usuário, com os campos derivados de cheque-especial.
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { description: Carteira com campos derivados. }
 *       401: { description: Sessão ausente ou inválida. }
 *       404: { description: Carteira não encontrada. }
 */
export class GetWalletByIdRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'wallet/list-by-id/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: WalletController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.listById;
  }

  public static create(
    controller: WalletController,
    middlewares: Middleware[] = [],
  ): GetWalletByIdRoute {
    return new GetWalletByIdRoute(controller, middlewares);
  }
}
