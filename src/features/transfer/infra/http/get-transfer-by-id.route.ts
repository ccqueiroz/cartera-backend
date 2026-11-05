import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { TransferController } from '@/features/transfer/infra/http/transfer.controller';

/**
 * @swagger
 * /api/transfer/list-by-id/{id}:
 *   get:
 *     summary: Detalhe de uma transferência do usuário autenticado.
 *     tags: [Transfer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { $ref: '#/components/responses/TransferOutputResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/TransferNotFound' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class GetTransferByIdRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'transfer/list-by-id/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: TransferController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.listById;
  }

  public static create(
    controller: TransferController,
    middlewares: Middleware[] = [],
  ): GetTransferByIdRoute {
    return new GetTransferByIdRoute(controller, middlewares);
  }
}
