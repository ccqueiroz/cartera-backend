import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/list-all:
 *   get:
 *     summary: Lista receitas por competencia (folhas, filtros do motor).
 *     tags: [Receivable]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { description: OK. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class ListReceivablesRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'receivable/list-all';
  public readonly handler: HttpHandler;

  private constructor(
    controller: ReceivableController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.listAll;
  }

  public static create(
    controller: ReceivableController,
    middlewares: Middleware[] = [],
  ): ListReceivablesRoute {
    return new ListReceivablesRoute(controller, middlewares);
  }
}
