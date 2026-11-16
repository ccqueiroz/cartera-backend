import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { CategoryController } from '@/features/category/infra/http/category.controller';

/**
 * @swagger
 * /api/category/{description_enum}:
 *   get:
 *     summary: Busca a categoria ativa por descriptionEnum.
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: description_enum
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { $ref: '#/components/responses/CategoryOutputResponse' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/CategoryNotFound' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class GetCategoryByEnumRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'category/:description_enum';
  public readonly handler: HttpHandler;

  private constructor(
    controller: CategoryController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.getByEnum;
  }

  public static create(
    controller: CategoryController,
    middlewares: Middleware[] = [],
  ): GetCategoryByEnumRoute {
    return new GetCategoryByEnumRoute(controller, middlewares);
  }
}
