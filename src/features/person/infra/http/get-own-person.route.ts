import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PersonController } from '@/features/person/infra/http/person.controller';

/**
 * @swagger
 * /api/person/me:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado.
 *     tags: [Person]
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { $ref: '#/components/responses/PersonOutputResponse' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/PersonNotFound' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class GetOwnPersonRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'person/me';
  public readonly handler: HttpHandler;

  private constructor(
    controller: PersonController,
    public readonly middlewares: Middleware[],
  ) {
    this.handler = controller.getOwn;
  }

  public static create(
    controller: PersonController,
    middlewares: Middleware[],
  ): GetOwnPersonRoute {
    return new GetOwnPersonRoute(controller, middlewares);
  }
}
