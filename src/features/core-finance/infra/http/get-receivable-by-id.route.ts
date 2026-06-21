import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/list-by-id/:id:
 *   get:
 *     summary: Detalhe da receita (no + filhas imediatas).
 *     tags: [Receivable]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { description: OK. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class GetReceivableByIdRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'receivable/list-by-id/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: ReceivableController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.listById;
  }

  public static create(
    controller: ReceivableController,
    middlewares: Middleware[] = [],
  ): GetReceivableByIdRoute {
    return new GetReceivableByIdRoute(controller, middlewares);
  }
}
