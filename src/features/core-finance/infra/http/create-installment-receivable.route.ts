import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/create-installment:
 *   post:
 *     summary: Cria uma receita parcelada (entrada recebida exige walletId).
 *     tags: [Receivable]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       201: { description: OK. }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class CreateInstallmentReceivableRoute implements Route {
  public readonly method: HttpMethod = 'post';
  public readonly path: string = 'receivable/create-installment';
  public readonly handler: HttpHandler;

  private constructor(
    controller: ReceivableController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.createInstallment;
  }

  public static create(
    controller: ReceivableController,
    middlewares: Middleware[] = [],
  ): CreateInstallmentReceivableRoute {
    return new CreateInstallmentReceivableRoute(controller, middlewares);
  }
}
