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
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Size'
 *       - in: query
 *         name: ordering
 *         schema: { type: string, enum: [occurredAt, amount, createdAt] }
 *       - $ref: '#/components/parameters/DirectionOrder'
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [direction, refType] }
 *       - $ref: '#/components/parameters/SortValue'
 *       - in: query
 *         name: search_by_date
 *         schema: { type: string, enum: [occurredAt, createdAt] }
 *       - $ref: '#/components/parameters/SearchByDateValue'
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { $ref: '#/components/responses/WalletMovementPageResponse' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/WalletNotFound' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
