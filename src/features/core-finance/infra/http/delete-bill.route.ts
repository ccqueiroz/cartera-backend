import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';

/**
 * @swagger
 * /api/bill/delete/:id:
 *   delete:
 *     summary: Exclui (soft-delete) a despesa; nao mexe em caixa.
 *     tags: [Bill]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       204: { description: OK. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class DeleteBillRoute implements Route {
  public readonly method: HttpMethod = 'delete';
  public readonly path: string = 'bill/delete/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: BillController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.delete;
  }

  public static create(
    controller: BillController,
    middlewares: Middleware[] = [],
  ): DeleteBillRoute {
    return new DeleteBillRoute(controller, middlewares);
  }
}
