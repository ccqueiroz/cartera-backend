import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { CategoryController } from '@/features/category/infra/http/category.controller';

/**
 * @swagger
 * /api/category/list-all:
 *   get:
 *     summary: Lista categorias ativas de um tipo.
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [BILLS, RECEIVABLE]
 *     responses:
 *       200:
 *         description: Categorias ativas do tipo.
 *       400:
 *         description: Type ausente ou fora do enum.
 */
export class ListCategoriesByTypeRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'category/list-all';
  public readonly handler: HttpHandler;

  private constructor(
    controller: CategoryController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.listAll;
  }

  public static create(
    controller: CategoryController,
    middlewares: Middleware[] = [],
  ): ListCategoriesByTypeRoute {
    return new ListCategoriesByTypeRoute(controller, middlewares);
  }
}
