import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { WalletController } from '@/features/wallet/infra/http/wallet.controller';

/**
 * @swagger
 * /api/wallet/statement/{id}:
 *   get:
 *     summary: Extrato (livro de caixa) de uma carteira, por competência.
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: month
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { description: Página de movimentos. }
 *       401: { description: Sessão ausente ou inválida. }
 *       404: { description: Carteira não encontrada. }
 */
export class WalletStatementRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'wallet/statement/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: WalletController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.statement;
  }

  public static create(
    controller: WalletController,
    middlewares: Middleware[] = [],
  ): WalletStatementRoute {
    return new WalletStatementRoute(controller, middlewares);
  }
}
