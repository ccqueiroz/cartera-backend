import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/delete/:id:
 *   delete:
 *     summary: Exclui (soft-delete) a receita; nao mexe em caixa.
 *     tags: [Receivable]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       204: { description: OK. }
 *       401: { description: Sessão ausente ou inválida. }
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
