import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { TransferController } from '@/features/transfer/infra/http/transfer.controller';

/**
 * @swagger
 * /api/transfer/list-all:
 *   get:
 *     summary: Lista as transferências do usuário autenticado, por competência, ordenadas desc.
 *     tags: [Transfer]
 *     parameters:
 *       - in: query
 *         name: month
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: size
 *         schema: { type: integer }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { description: Página de transferências. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class ListTransfersRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'transfer/list-all';
  public readonly handler: HttpHandler;

  private constructor(
    controller: TransferController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.listAll;
  }

  public static create(
    controller: TransferController,
    middlewares: Middleware[] = [],
  ): ListTransfersRoute {
    return new ListTransfersRoute(controller, middlewares);
  }
}
