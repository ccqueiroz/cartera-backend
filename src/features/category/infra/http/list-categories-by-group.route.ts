import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { CategoryController } from '@/features/category/infra/http/category.controller';

/**
 * @swagger
 * /api/category/list-by-groups/{group}:
 *   get:
 *     summary: Lista categorias ativas de um grupo filtradas por tipo.
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: group
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [BILLS, RECEIVABLES]
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { $ref: '#/components/responses/CategoryListResponse' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class ListCategoriesByGroupRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'category/list-by-groups/:group';
  public readonly handler: HttpHandler;

  private constructor(
    controller: CategoryController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.listByGroups;
  }

  public static create(
    controller: CategoryController,
    middlewares: Middleware[] = [],
  ): ListCategoriesByGroupRoute {
    return new ListCategoriesByGroupRoute(controller, middlewares);
  }
}
