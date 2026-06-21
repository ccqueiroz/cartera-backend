import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';

/**
 * @swagger
 * /api/bill/create:
 *   post:
 *     summary: Cria uma despesa única (a vencer ou nascida paga, exigindo walletId).
 *     tags: [Bill]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       201: { description: Despesa criada. }
 *       400: { description: Payload inválido (ex.: nascida paga sem walletId). }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class CreateBillRoute implements Route {
  public readonly method: HttpMethod = 'post';
  public readonly path: string = 'bill/create';
  public readonly handler: HttpHandler;

  private constructor(
    controller: BillController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.create;
  }

  public static create(
    controller: BillController,
    middlewares: Middleware[] = [],
  ): CreateBillRoute {
    return new CreateBillRoute(controller, middlewares);
  }
}
