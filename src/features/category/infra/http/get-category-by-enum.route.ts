import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { CategoryController } from '@/features/category/infra/http/category.controller';

/**
 * @swagger
 * /api/category/description/{descriptionEnum}:
 *   get:
 *     summary: Busca a categoria ativa por descriptionEnum.
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
 *       200:
 *         description: Categoria ativa encontrada.
 *       400:
 *         description: descriptionEnum fora do enum.
 *       401:
 *         description: Sessão ausente ou inválida.
 *       404:
 *         description: Não existe ou está soft-deleted.
 */
export class GetCategoryByEnumRoute implements Route {
  public readonly method: HttpMethod = 'get';
  public readonly path: string = 'category/description/:descriptionEnum';
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
