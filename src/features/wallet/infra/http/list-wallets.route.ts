import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { WalletController } from '@/features/wallet/infra/http/wallet.controller';

/**
 * @swagger
 * /api/wallet/list-all:
 *   get:
 *     summary: Lista as carteiras ativas do usuário autenticado.
 *     tags: [Wallet]
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Size'
 *       - in: query
 *         name: ordering
 *         schema: { type: string, enum: [name, balance, createdAt] }
 *       - $ref: '#/components/parameters/DirectionOrder'
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [isDefault] }
 *       - $ref: '#/components/parameters/SortValue'
 *       - in: query
 *         name: search_by_date
 *         schema: { type: string, enum: [createdAt] }
 *       - $ref: '#/components/parameters/SearchByDateValue'
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { $ref: '#/components/responses/WalletPageResponse' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
