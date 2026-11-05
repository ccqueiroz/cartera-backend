import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { CategoryController } from '@/features/category/infra/http/category.controller';

/**
 * @swagger
 * /api/category/create:
 *   post:
 *     summary: Cria uma categoria (ou reativa um slot soft-deleted).
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, descriptionEnum, group, type]
 *             properties:
 *               description: { type: string }
 *               descriptionEnum: { type: string }
 *               group: { type: string }
 *               type: { type: string, enum: [BILLS, RECEIVABLES] }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       201: { $ref: '#/components/responses/CategoryOutputResponse' }
 *       200: { $ref: '#/components/responses/CategoryOutputResponse' }
 *       400: { $ref: '#/components/responses/CategoryBadRequest' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       409: { $ref: '#/components/responses/CategoryAlreadyExists' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class CreateCategoryRoute implements Route {
  public readonly method: HttpMethod = 'post';
  public readonly path: string = 'category/create';
  public readonly handler: HttpHandler;

  private constructor(
    controller: CategoryController,
    public readonly middlewares: Middleware[] = [],
  ) {
    this.handler = controller.create;
  }

  public static create(
    controller: CategoryController,
    middlewares: Middleware[] = [],
  ): CreateCategoryRoute {
    return new CreateCategoryRoute(controller, middlewares);
  }
}
