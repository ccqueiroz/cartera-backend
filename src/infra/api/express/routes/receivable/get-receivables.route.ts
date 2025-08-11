import { GetReceivablesUseCase } from '@/usecases/receivable/get-receivables.usecase';
import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import {
  GetReceivablesInputDTO,
  OrderByGetReceivablesInputDTO,
  SortByReceivableTypeInputDTO,
} from '@/domain/Receivable/dtos/receivable.dto';
import { runValidate } from '@/packages/clients/class-validator';
import { GetReceivablesInputValidationDTO } from '../../schema_validations/Receivable/receivable.schema';
import { GetReceivablesInputRouteDTO } from '../../dtos/get-receivables-input-route.dto';
import { SortByStatusInputDTO } from '@/domain/Helpers/dtos/sort-by-status-input.dto';
import { ReceivableSearchByDateDTO } from '@/domain/Helpers/dtos/search-by-date-input.dto';

/**
 * @swagger
 * /api/receivable/list-all:
 *   get:
 *     summary: Lista todas as receitas cadastradas para o usuário com filtros e paginação.
 *     description: Retorna uma lista paginada de receitas com base nos critérios de filtro, ordenação e parâmetros de paginação.
 *     tags:
 *       - Receivable
 *     security:
 *       - sessionCookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: true
 *         schema:
 *           type: number
 *           example: 0
 *         description: Número da página (começando em 0).
 *       - in: query
 *         name: size
 *         required: true
 *         schema:
 *           type: number
 *           example: 10
 *         description: Quantidade de itens por página.
 *       - in: query
 *         name: fixedReceivable
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filtra receitas fixas.
 *       - in: query
 *         name: receival
 *         required: false
 *         schema:
 *           type: boolean
 *           example: false
 *         description: Filtra receitas a receber.
 *       - in: query
 *         name: amount
 *         required: false
 *         schema:
 *           type: number
 *           example: 1293.89
 *         description: Valor específico da receita.
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           enum: [category, categoryGroup, paymentMethod, paymentStatus]
 *           example: category
 *         description: Filtra por uma categoria de status usando o enum.
 *       - in: query
 *         name: sort_value
 *         required: false
 *         schema:
 *           type: string
 *           example: MOBILITY_BY_APP
 *         description: Valor correspondente ao campo de filtro.
 *       - in: query
 *         name: search_by_date
 *         required: false
 *         schema:
 *           type: string
 *           enum: [receivalDate, receivableDate]
 *           example: receivalDate
 *         description: Tipo de data usada na filtragem.
 *       - in: query
 *         name: search_by_date_value
 *         required: false
 *         schema:
 *           type: string
 *           example: "1735689600000-1743465600000"
 *         description: Valor da data. Pode ser um único timestamp ou dois separados por hífen (initialDate-finalDate).
 *       - in: query
 *         name: ordering
 *         required: false
 *         schema:
 *           type: string
 *           enum: [amount, receivableDate, receivalDate, categoryId, paymentMethodId, paymentStatusId, createdAt, updatedAt]
 *           example: amount
 *         description: Ordena em função do atributo escolhido.
 *       - in: query
 *         name: direction_order
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: asc
 *         description: Direção que a ordenação deve seguir.
 *     responses:
 *       200:
 *         description: Lista de receitas retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ReceivableDTO'
 *                     page:
 *                       type: number
 *                       example: 0
 *                     size:
 *                       type: number
 *                       example: 10
 *                     totalElements:
 *                       type: number
 *                       example: 50
 *                     totalPages:
 *                       type: number
 *                       example: 5
 *       400:
 *         description: Parâmetros inválidos ou ausentes. | Parâmetros de entrada inválidos.
 *       401:
 *         description: Token de autenticação inválido ou ausente.
 *       404:
 *         description: Nenhuma receita encontrada com os critérios fornecidos.
 *       500:
 *         description: Erro interno no servidor.
 */
export class GetReceivablesRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getReceivablesService: GetReceivablesUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    getReceivablesService: GetReceivablesUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new GetReceivablesRoute(
      'receivable/list-all',
      HttpMethod.GET,
      getReceivablesService,
      middlewares,
    );
  }

  private handleBuildInputDTO({
    userId,
    page,
    size,
    fixedReceivable,
    receival,
    amount,
    sort,
    sort_value,
    search_by_date,
    search_by_date_value,
    ordering,
    direction_order,
  }: GetReceivablesInputRouteDTO) {
    const sortByParams =
      sort && sort_value
        ? {
            sort: {
              [sort]: sort_value,
            } as Partial<SortByStatusInputDTO>,
          }
        : {};

    const sortByReceivables: Partial<SortByReceivableTypeInputDTO> = {
      ...(fixedReceivable !== undefined && { fixedReceivable }),
      ...(receival !== undefined && { receival }),
      ...(amount !== undefined && { amount }),
    };

    let searchByDate: Partial<ReceivableSearchByDateDTO> = {};
    if (search_by_date && search_by_date_value) {
      const [startDate, endDate] = search_by_date_value.split('-');
      searchByDate = {
        [search_by_date]: endDate
          ? { initialDate: +startDate, finalDate: +endDate }
          : { exactlyDate: +startDate },
      };
    }

    const orderingByParams =
      ordering && direction_order
        ? ({
            ordering: { [ordering]: direction_order },
          } as Partial<OrderByGetReceivablesInputDTO>)
        : {};

    return {
      authUserId: userId,
      page: +page,
      size: +size,
      ...sortByReceivables,
      ...sortByParams,
      ...(Object.keys(searchByDate).length && { searchByDate }),
      ...orderingByParams,
    };
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user_auth } = request;
        const {
          page,
          size,
          fixedReceivable,
          receival,
          amount,
          sort,
          sort_value,
          search_by_date,
          search_by_date_value,
          ordering,
          direction_order,
        } = request.query;

        const buildDTO = this.handleBuildInputDTO({
          userId: user_auth?.userId,
          page,
          size,
          fixedReceivable,
          receival,
          amount,
          sort,
          sort_value,
          search_by_date,
          search_by_date_value,
          ordering,
          direction_order,
        } as unknown as GetReceivablesInputRouteDTO);

        const errors = await runValidate<GetReceivablesInputValidationDTO>(
          GetReceivablesInputValidationDTO,
          buildDTO,
        );

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        const receivables = await this.getReceivablesService.execute({
          ...buildDTO,
          userId: buildDTO?.authUserId,
        } as GetReceivablesInputDTO);

        response.status(200).json({ ...receivables });
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
