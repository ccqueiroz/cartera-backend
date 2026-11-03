import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/edit/{id}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     summary: Edita a receita (com propagacao opcional).
 *     tags: [Receivable]
 *     security: [{ sessionCookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number }
 *               dueDate: { type: string }
 *               categoryDescriptionEnum: { type: string }
 *               propagate: { type: boolean }
 *     responses:
 *       200: { description: OK. }
 *       400: { description: "Payload inválido." }
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
