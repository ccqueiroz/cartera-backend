import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PersonController } from '@/features/person/infra/http/person.controller';

/**
 * @swagger
 * /api/person/me:
 *   delete:
 *     summary: Soft delete terminal disable-first (desabilita conta, revoga tokens, marca deletedAt).
 *     tags: [Person]
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       204:
 *         description: Conta desabilitada e perfil marcado como deletado (idempotente).
 *       401:
 *         description: Sessão ausente ou inválida.
 *       404:
 *         description: Perfil não encontrado.
 */
export class DeleteOwnPersonRoute implements Route {
  public readonly method: HttpMethod = 'delete';
  public readonly path: string = 'person/me';
  public readonly handler: HttpHandler;

  private constructor(
    controller: PersonController,
    public readonly middlewares: Middleware[],
  ) {
    this.handler = controller.deleteOwn;
  }

  public static create(
    controller: PersonController,
    middlewares: Middleware[],
  ): DeleteOwnPersonRoute {
    return new DeleteOwnPersonRoute(controller, middlewares);
  }
}
