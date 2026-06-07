import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { CategoryController } from '@/features/category/infra/http/category.controller';

/**
 * @swagger
 * /api/category:
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
 *       201:
 *         description: Categoria criada.
 *       200:
 *         description: Slot soft-deleted reativado.
 *       400:
 *         description: Payload inválido.
 *       401:
 *         description: Sessão ausente ou inválida.
 *       403:
 *         description: Sem autorização de escrita (gate TBD).
 *       409:
 *         description: descriptionEnum já ativo.
 */
export class CreateCategoryRoute implements Route {
  public readonly method: HttpMethod = 'post';
  public readonly path: string = 'category';
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
