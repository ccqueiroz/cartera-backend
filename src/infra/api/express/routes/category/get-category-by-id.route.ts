import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { GetCategoryByIdUseCase } from '@/usecases/category/get-category-by-id.usecase';

/**
 * @swagger
 * /api/category/list-by-id/{id}:
 *   get:
 *     summary: Retorna uma categoria de gastos pelo ID.
 *     description: Esta rota retorna os detalhes de uma categoria de gastos específico no sistema, dado o seu ID.
 *     tags:
 *       - Category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da categoria.
 *         schema:
 *           type: string
 *           example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *     responses:
 *       200:
 *         description: Retorna a categoria com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID da categoria.
 *                   example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *                 description:
 *                   type: string
 *                   description: Descrição da categoria.
 *                   example: App Mobilidade
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Data de criação da categoria.
 *                   example: 2024-01-01T00:00:00Z
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Data de atualização da categoria.
 *                   example: 2024-01-10T12:00:00Z
 *       401:
 *         description: Credenciais inválidas.
 *       404:
 *         description: Categoria não encontrado.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */
export class GetCategoryByIdRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getCategoryByIdService: GetCategoryByIdUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    getCategoryByIdService: GetCategoryByIdUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new GetCategoryByIdRoute(
      'category/list-by-id/:id',
      HttpMethod.GET,
      getCategoryByIdService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { id } = request.params;

        if (!id)
          throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);

        const category = await this.getCategoryByIdService.execute({
          id,
        });

        if (!category)
          throw new ApiError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, 404);

        response.status(200).json({ ...category });
      } catch (error) {
        next(
          error instanceof ApiError
            ? error
            : new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500),
        );
      }
    };
  }

  public getPath(): string {
    return this.path;
  }

  public getMethod(): HttpMethod {
    return this.method;
  }

  public getMiddlewares() {
    return this.middlewares;
  }
}
