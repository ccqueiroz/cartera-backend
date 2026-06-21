import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/edit/:id:
 *   put:
 *     summary: Edita a receita (com propagacao opcional).
 *     tags: [Receivable]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { description: OK. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class EditReceivableRoute implements Route {
  public readonly method: HttpMethod = 'put';
  public readonly path: string = 'receivable/edit/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: ReceivableController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.edit;
  }

  public static create(
    controller: ReceivableController,
    middlewares: Middleware[] = [],
  ): EditReceivableRoute {
    return new EditReceivableRoute(controller, middlewares);
  }
}
