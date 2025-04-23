import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { GetBillsUseCase } from '@/usecases/bill/get-bills.usecase';
import { GetBillsInputDTO } from '@/domain/Bill/dtos/bill.dto';
import { runValidate } from '@/packages/clients/class-validator';
import { GetBillsInputValidationDTO } from '../../schema_validations/Bill/bill.schema';

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sortByBills:
 *                 type: object
 *                 properties:
 *                   fixedBill:
 *                     type: boolean
 *                     example: true
 *                   payOut:
 *                     type: boolean
 *                     example: false
 *                   amount:
 *                     type: number
 *                     example: 1000.50
 *                   isShoppingListBill:
 *                     type: boolean
 *                     example: true
 *                   isPaymentCardBill:
 *                     type: boolean
 *                     example: true
 *               searchByDate:
 *                 oneOf:
 *                   - type: object
 *                     properties:
 *                       billDate:
 *                         type: object
 *                         properties:
 *                           initialDate:
 *                             type: number
 *                             example: 1739751148154
 *                           finalDate:
 *                             type: number
 *                             example: 1739837548154
 *                           exactlyDate:
 *                             type: number
 *                             example: 1739751148154
 *                   - type: object
 *                     properties:
 *                       payDate:
 *                         type: object
 *                         properties:
 *                           initialDate:
 *                             type: number
 *                             example: 1739751148154
 *                           finalDate:
 *                             type: number
 *                             example: 1739837548154
 *                           exactlyDate:
 *                             type: number
 *                             example: 1739751148154
 *               sort:
 *                 type: object
 *                 oneOf:
 *                   - properties:
 *                       paymentStatusId:
 *                         type: string
 *                         example: 68e47c3b-6d34-4604-bf7c-f9e2da704107
 *                     required: [paymentStatusId]
 *                   - properties:
 *                       categoryId:
 *                         type: string
 *                         example: c2ecc075-82d2-406b-88cd-491c686654eb
 *                     required: [categoryId]
 *                   - properties:
 *                       paymentMethodId:
 *                         type: string
 *                         example: c4dcb140-1c3e-411c-b6e1-f3cdb55b3c54
 *                     required: [paymentMethodId]
 *               ordering:
 *                 type: object
 *                 oneOf:
 *                   - $ref: '#/components/schemas/OrderByAmount'
 *                   - $ref: '#/components/schemas/OrderByBillDate'
 *                   - $ref: '#/components/schemas/OrderByPayDate'
 *                   - $ref: '#/components/schemas/OrderByCategory'
 *                   - $ref: '#/components/schemas/OrderByPaymentMethod'
 *                   - $ref: '#/components/schemas/OrderByPaymentStatus'
 *                   - $ref: '#/components/schemas/OrderByCreated'
 *                   - $ref: '#/components/schemas/OrderByUpdated'
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

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user_auth } = request;
        const { page, size } = request.query;
        const { sortByBills, searchByDate, ordering, sort } = request.body;

        const errors = await runValidate<GetBillsInputValidationDTO>(
          GetBillsInputValidationDTO,
          {
            page: page as unknown as number,
            size: size as unknown as number,
            sort,
            ordering,
            searchByDate,
            sortByBills,
            authUserId: user_auth?.userId as string,
          },
        );

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        const bills = await this.getBillsService.execute({
          userId: user_auth?.userId,
          sortByBills,
          searchByDate,
          ordering,
          page,
          size,
          sort,
        } as unknown as GetBillsInputDTO);

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
