import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { GetBillsPayableMonthUseCase } from '@/usecases/bill/get-bills-payable-month.usecase';
import { BillsPayableMonthInputDTO } from '@/domain/Bill/dtos/bill.dto';
import { GetBillsPayableMonthDTO } from '../../schema_validations/Bill/bill.schema';
import { runValidate } from '@/packages/clients/class-validator';

/**
 * @swagger
 * /api/bill/by-month-status:
 *   get:
 *     summary: Lista todas as contas/despesas cadastradas no mês para o usuário com filtro por período.
 *     description:
 *       Retorna uma lista todas as contas/despesas cadastradas no mês para o usuário com filtro por período.
 *     tags:
 *       - Bill
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: initialDate
 *         required: true
 *         schema:
 *           type: number
 *           example: 1740798000000
 *         description: Início do período para análise.
 *       - in: query
 *         name: finalDate
 *         required: true
 *         schema:
 *           type: number
 *           example: 1743390000000
 *         description: Final do período para análise.
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
 *                        $ref: '#/components/schemas/BillsPayableMonthOutPutDTO'
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
 *
 *       400:
 *         description: Período de pesquisa inválido. Por favor, informe o período de análise. | Parâmetros de entrada inválidos.
 *       401:
 *         description: Credenciais Inválidas.
 *       500:
 *         description: Erro interno no servidor.
 */

export class GetBillsPayableMonthRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getBillsPayableMonth: GetBillsPayableMonthUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    getBillsPayableMonth: GetBillsPayableMonthUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new GetBillsPayableMonthRoute(
      'bill/by-month-status',
      HttpMethod.GET,
      getBillsPayableMonth,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user_auth } = request;
        const { initialDate, finalDate, page, size } = request.query;

        const errors = await runValidate<GetBillsPayableMonthDTO>(
          GetBillsPayableMonthDTO,
          {
            initialDate: Number(initialDate),
            finalDate: Number(finalDate),
            authUserId: user_auth?.userId as string,
            page: Number(page),
            size: Number(size),
          },
        );

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        const bills = await this.getBillsPayableMonth.execute({
          userId: user_auth?.userId,
          period: {
            initialDate: Number(initialDate),
            finalDate: Number(finalDate),
          },
          page: Number(page),
          size: Number(size),
        } as BillsPayableMonthInputDTO);

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
