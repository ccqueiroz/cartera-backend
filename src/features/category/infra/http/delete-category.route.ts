import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { CategoryController } from '@/features/category/infra/http/category.controller';

/**
 * @swagger
 * /api/category/delete/{descriptionEnum}:
 *   delete:
 *     summary: Soft-deleta uma categoria ativa (documento permanece).
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: descriptionEnum
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       204: { description: "Categoria soft-deletada." }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/CategoryNotFound' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class DeleteCategoryRoute implements Route {
  public readonly method: HttpMethod = 'delete';
  public readonly path: string = 'category/delete/:descriptionEnum';
  public readonly handler: HttpHandler;

  private constructor(
    controller: CategoryController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.remove;
  }

  public static create(
    controller: CategoryController,
    middlewares: Middleware[] = [],
  ): DeleteCategoryRoute {
    return new DeleteCategoryRoute(controller, middlewares);
  }
}
