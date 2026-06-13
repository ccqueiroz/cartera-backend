import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { CategoryController } from '@/features/category/infra/http/category.controller';

/**
 * @swagger
 * /api/category/list-groups:
 *   get:
 *     summary: Lista os grupos distintos com ≥1 categoria ativa do tipo.
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [BILLS, RECEIVABLES]
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200:
 *         description: Grupos distintos do tipo.
 *       400:
 *         description: Type ausente ou fora do enum.
 *       401:
 *         description: Sessão ausente ou inválida.
 */
export class ListGroupsByTypeRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'category/list-groups';
  public readonly handler: HttpHandler;

  private constructor(
    controller: CategoryController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.listGroups;
  }

  public static create(
    controller: CategoryController,
    middlewares: Middleware[] = [],
  ): ListGroupsByTypeRoute {
    return new ListGroupsByTypeRoute(controller, middlewares);
  }
}
