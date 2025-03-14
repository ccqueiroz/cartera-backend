import { GetCategoriesUseCase } from '@/usecases/category/get-categories.usecase';
import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';

/**
 * @swagger
 * /api/category/list-all:
 *   get:
 *     summary: Retorna uma lista de categorias de gastos.
 *     description: Esta rota retorna uma lista de categorias de gastos disponíveis no sistema.
 *     tags:
 *       - Category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [BILLS, RECEIVABLE]
 *           example: BILLS
 *         description: Filtra as categorias pelo tipo.
 *     responses:
 *       200:
 *         description: Retorna a lista de categorias de gastos com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CategoryDTO'
 *       400:
 *         description: O valor fornecido para o parâmetro "type" não corresponde a nenhuma categoria válida.
 *       401:
 *         description: Credenciais inválidas.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */
export class GetCategoriesRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getCategoriesService: GetCategoriesUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    getCategoriesService: GetCategoriesUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new GetCategoriesRoute(
      'category/list-all',
      HttpMethod.GET,
      getCategoriesService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { type } = request.query;

        if (
          type &&
          typeof type !== 'string' &&
          !Object.keys(CategoryType).includes(type as unknown as string)
        ) {
          throw new ApiError(ERROR_MESSAGES.CATEGORY_NOT_EXIST, 400);
        }

        const categoryType =
          type && typeof type === 'string' ? (type as CategoryType) : undefined;

        const categories = await this.getCategoriesService.execute(
          categoryType ? { type: categoryType } : undefined,
        );

        response.status(200).json({ ...categories });
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
