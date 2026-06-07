import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { CategoryController } from '@/features/category/infra/http/category.controller';

/**
 * @swagger
 * /api/category/{descriptionEnum}:
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
 *       204:
 *         description: Categoria soft-deletada.
 *       401:
 *         description: Sessão ausente ou inválida.
 *       403:
 *         description: Sem autorização de escrita (gate TBD).
 *       404:
 *         description: Não existe ou já está soft-deleted.
 */
export class DeleteCategoryRoute implements Route {
  public readonly method: HttpMethod = 'delete';
  public readonly path: string = 'category/:descriptionEnum';
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
