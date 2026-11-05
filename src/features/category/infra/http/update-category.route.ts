import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { CategoryController } from '@/features/category/infra/http/category.controller';

/**
 * @swagger
 * /api/category/edit/{descriptionEnum}:
 *   put:
 *     summary: Edita uma categoria ativa (descriptionEnum imutável).
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: descriptionEnum
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, group, type]
 *             properties:
 *               description: { type: string }
 *               group: { type: string }
 *               type: { type: string, enum: [BILLS, RECEIVABLES] }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { $ref: '#/components/responses/CategoryOutputResponse' }
 *       400: { $ref: '#/components/responses/CategoryBadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/CategoryNotFound' }
 *       422: { $ref: '#/components/responses/CategoryDescriptionEnumImmutable' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class UpdateCategoryRoute implements Route {
  public readonly method: HttpMethod = 'put';
  public readonly path: string = 'category/edit/:descriptionEnum';
  public readonly handler: HttpHandler;

  private constructor(
    controller: CategoryController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.update;
  }

  public static create(
    controller: CategoryController,
    middlewares: Middleware[] = [],
  ): UpdateCategoryRoute {
    return new UpdateCategoryRoute(controller, middlewares);
  }
}
