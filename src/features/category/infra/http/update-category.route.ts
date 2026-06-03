import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { CategoryController } from '@/features/category/infra/http/category.controller';

/**
 * @swagger
 * /api/category/{descriptionEnum}:
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
 *     responses:
 *       200:
 *         description: Categoria atualizada.
 *       400:
 *         description: Payload inválido.
 *       403:
 *         description: Sem autorização de escrita (gate TBD).
 *       404:
 *         description: Não existe ou está soft-deleted.
 *       422:
 *         description: Tentativa de trocar o descriptionEnum imutável.
 */
export class UpdateCategoryRoute implements Route {
  public readonly method: HttpMethod = 'put';
  public readonly path: string = 'category/:descriptionEnum';
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
