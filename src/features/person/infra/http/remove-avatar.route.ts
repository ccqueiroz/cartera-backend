import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PersonController } from '@/features/person/infra/http/person.controller';

/**
 * @swagger
 * /api/person/me/avatar:
 *   delete:
 *     summary: Remove o avatar (deleta do bucket e zera avatarUrl).
 *     tags: [Person]
 *     responses:
 *       204:
 *         description: Avatar removido (no-op se não havia avatar).
 *       401:
 *         description: Sessão ausente ou inválida.
 *       404:
 *         description: Perfil não encontrado.
 */
export class RemoveAvatarRoute implements Route {
  public readonly method: HttpMethod = 'delete';
  public readonly path: string = 'person/me/avatar';
  public readonly handler: HttpHandler;

  private constructor(
    controller: PersonController,
    public readonly middlewares: Middleware[],
  ) {
    this.handler = controller.removeAvatar;
  }

  public static create(
    controller: PersonController,
    middlewares: Middleware[],
  ): RemoveAvatarRoute {
    return new RemoveAvatarRoute(controller, middlewares);
  }
}
