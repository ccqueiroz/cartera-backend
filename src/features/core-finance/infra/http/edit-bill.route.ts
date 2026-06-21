import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';

/**
 * @swagger
 * /api/bill/edit/:id:
 *   put:
 *     summary: Edita a despesa (com propagacao opcional).
 *     tags: [Bill]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       200: { description: OK. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class EditBillRoute implements Route {
  public readonly method: HttpMethod = 'put';
  public readonly path: string = 'bill/edit/:id';
  public readonly handler: HttpHandler;

  private constructor(
    controller: BillController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.edit;
  }

  public static create(
    controller: BillController,
    middlewares: Middleware[] = [],
  ): EditBillRoute {
    return new EditBillRoute(controller, middlewares);
  }
}
