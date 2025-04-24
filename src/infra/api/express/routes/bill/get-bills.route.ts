import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { GetBillsUseCase } from '@/usecases/bill/get-bills.usecase';
import {
  GetBillsInputDTO,
  OrderByGetBillsInputDTO,
  SearchByDateGetBillsInputDTO,
  SortByBillTypeInputDTO,
} from '@/domain/Bill/dtos/bill.dto';
import { runValidate } from '@/packages/clients/class-validator';
import { GetBillsInputValidationDTO } from '../../schema_validations/Bill/bill.schema';
import { GetBillsInputRouteDTO } from '../../dtos/get-bills-input-route.dto';
import { SortByStatusReceivablesInputDTO } from '@/domain/Receivable/dtos/receivable.dto';

/**
 * @swagger
 * /api/bill/list-all:
 *   get:
 *     summary: Lista todas as contas/despesas cadastradas para o usuário com filtros e paginação.
 *     description:
 *       Retorna uma lista paginada de contas/despesas com base nos critérios de filtro, ordenação e parâmetros de paginação.
 *     tags:
 *       - Bill
 *     security:
 *       - bearerAuth: []
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
 *         name: fixedBill
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filtra despesas fixas.
 *       - in: query
 *         name: payOut
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filtra despesas pagas.
 *       - in: query
 *         name: isShoppingListBill
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filtra despesas com listas de compras.
 *       - in: query
 *         name: isPaymentCardBill
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Filtra despesas com cartão de pagamento.
 *       - in: query
 *         name: amount
 *         required: false
 *         schema:
 *           type: number
 *           example: 1293.89
 *         description: Valor específico à pagar.
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           enum: [categoryId, paymentMethodId, paymentStatusId]
 *           example: categoryId
 *         description: Filtra por uma categoria de status usando o ID.
 *       - in: query
 *         name: sort_value
 *         required: false
 *         schema:
 *           type: string
 *           example: 12zgh2822-9863abs-7zhts
 *         description: Valor correspondente ao campo de filtro.
 *       - in: query
 *         name: search_by_date
 *         required: false
 *         schema:
 *           type: string
 *           enum: [billDate, payDate]
 *           example: billDate
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
 *           enum: [amount, billDate, payDate, categoryId, paymentMethodId, paymentStatusId, createdAt, updatedAt]
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
 *         description: Lista de contas/despesas retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                    content:
 *                      type: array
 *                      items:
 *                        $ref: '#/components/schemas/BillDTO'
 *                    page:
 *                      type: number
 *                      example: 0
 *                    size:
 *                      type: number
 *                      example: 10
 *                    totalElements:
 *                      type: number
 *                      example: 50
 *                    totalPages:
 *                      type: number
 *                      example: 5
 *       400:
 *         description: Parâmetros inválidos ou ausentes. | Parâmetros de entrada inválidos.
 *       401:
 *         description: Token de autenticação inválido ou ausente.
 *       500:
 *         description: Erro interno no servidor.
 */

export class GetBillsRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getBillsService: GetBillsUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    getBillsService: GetBillsUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new GetBillsRoute(
      'bill/list-all',
      HttpMethod.GET,
      getBillsService,
      middlewares,
    );
  }

  private handleBuildInputDTO({
    userId,
    page,
    size,
    fixedBill,
    payOut,
    isShoppingListBill,
    isPaymentCardBill,
    amount,
    sort,
    sort_value,
    search_by_date,
    search_by_date_value,
    ordering,
    direction_order,
  }: GetBillsInputRouteDTO) {
    const sortByParams =
      sort && sort_value
        ? {
            sort: {
              [sort]: sort_value,
            } as Partial<SortByStatusReceivablesInputDTO>,
          }
        : {};

    const sortByBills: Partial<SortByBillTypeInputDTO> = {
      ...(fixedBill !== undefined && { fixedBill }),
      ...(payOut !== undefined && { payOut }),
      ...(isShoppingListBill !== undefined && { isShoppingListBill }),
      ...(isPaymentCardBill !== undefined && { isPaymentCardBill }),
      ...(amount !== undefined && { amount }),
    };

    let searchByDate: Partial<SearchByDateGetBillsInputDTO> = {};
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
          } as Partial<OrderByGetBillsInputDTO>)
        : {};

    return {
      authUserId: userId,
      page: +page,
      size: +size,
      ...sortByBills,
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
          fixedBill,
          payOut,
          isShoppingListBill,
          isPaymentCardBill,
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
          fixedBill,
          payOut,
          isShoppingListBill,
          isPaymentCardBill,
          amount,
          sort,
          sort_value,
          search_by_date,
          search_by_date_value,
          ordering,
          direction_order,
        } as unknown as GetBillsInputRouteDTO);

        const errors = await runValidate<GetBillsInputValidationDTO>(
          GetBillsInputValidationDTO,
          buildDTO,
        );

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        const bills = await this.getBillsService.execute({
          ...buildDTO,
          userId: buildDTO?.authUserId,
        } as GetBillsInputDTO);

        response.status(200).json({ ...bills });
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
