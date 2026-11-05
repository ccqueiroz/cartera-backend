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
 *       200: { $ref: '#/components/responses/CategoryGroupListResponse' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
