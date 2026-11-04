import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';

/**
 * @swagger
 * /api/bill/edit/{id}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     summary: Edita a despesa (com propagacao opcional).
 *     tags: [Bill]
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
 *       200: { $ref: '#/components/responses/TransactionOutputResponse' }
 *       400: { $ref: '#/components/responses/TransactionEditBadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/TransactionNotFound' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
