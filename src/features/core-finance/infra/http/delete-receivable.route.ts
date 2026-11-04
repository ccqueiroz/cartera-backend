import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/delete/{id}:
 *   delete:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     summary: Exclui (soft-delete) a receita; nao mexe em caixa.
 *     tags: [Receivable]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       204: { description: "Receita excluída, sem corpo." }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/TransactionNotFound' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class DeleteReceivableRoute implements Route {
  public readonly method: HttpMethod = 'delete';
  public readonly path: string = 'receivable/delete/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: ReceivableController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.delete;
  }

  public static create(
    controller: ReceivableController,
    middlewares: Middleware[] = [],
  ): DeleteReceivableRoute {
    return new DeleteReceivableRoute(controller, middlewares);
  }
}
