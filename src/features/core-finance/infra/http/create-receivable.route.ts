import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';

/**
 * @swagger
 * /api/receivable/create:
 *   post:
 *     summary: Cria uma receita única (a receber ou nascida recebida, exigindo walletId).
 *     tags: [Receivable]
 *     security: [{ sessionCookieAuth: [] }]
 *     responses:
 *       201: { description: Receita criada. }
 *       400: { description: Payload inválido (ex.: nascida recebida sem walletId). }
 *       401: { description: Sessão ausente ou inválida. }
 */
export class CreateReceivableRoute implements Route {
  public readonly method: HttpMethod = 'post';
  public readonly path: string = 'receivable/create';
  public readonly handler: HttpHandler;

  private constructor(
    controller: ReceivableController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.create;
  }

  public static create(
    controller: ReceivableController,
    middlewares: Middleware[] = [],
  ): CreateReceivableRoute {
    return new CreateReceivableRoute(controller, middlewares);
  }
}
