import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/reverse/:id:
 *   patch:
 *     summary: Estorna um recebimento (debita o caixa na wallet original).
 *     tags: [Receivable]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { description: OK. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class ReverseReceivableRoute implements Route {
  public readonly method: HttpMethod = 'patch';
  public readonly path: string = 'receivable/reverse/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: ReceivableController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.reverse;
  }

  public static create(
    controller: ReceivableController,
    middlewares: Middleware[] = [],
  ): ReverseReceivableRoute {
    return new ReverseReceivableRoute(controller, middlewares);
  }
}
