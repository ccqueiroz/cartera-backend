import { NextFunction, Request, Response } from 'express';
import { HttpMiddleware } from '../../middlewares/middleware';
import { HttpMethod, Route } from '../route';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { GetInvoicesByCategoriesAndPeriodValidationDTO } from '../../schema_validations/Invoice/invoice.schema';
import { runValidate } from '@/packages/clients/class-validator';
import { CategoryTypeEnum } from '../../schema_validations/Category/category.schema';
import { GetInvoicesByCategoryAndPeriodInputDTO } from '@/domain/Invoice/dtos/invoice.dto';
import { GetInvoicesByCategoriesAndByPeriodUseCase } from '@/usecases/invoices/get-invoices-by-categories-and-by-period.usecase';

/**
 * @swagger
 * /api/invoice/categories-by-period:
 *   get:
 *     summary: Lista o total de faturas por categoria dentro de um período.
 *     description: Retorna o total consolidado de valores agrupados por categoria para as faturas (despesas ou receitas) do usuário dentro de um período informado.
 *     tags:
 *       - Invoice
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
 *         description: Filtra faturas pelos tipos de categorias BILLS (despesas) ou RECEIVABLE (receitas).
 *       - in: query
 *         name: paid
 *         required: false
 *         schema:
 *           type: boolean
 *           example: false
 *         description: Filtra as faturas que já estão efetivamente pagas (despesas) ou recebidas (receitas).
 *       - in: query
 *         name: initialDate
 *         required: true
 *         schema:
 *           type: number
 *           example: 1740798000000
 *         description: Timestamp do início do período para análise das faturas.
 *       - in: query
 *         name: finalDate
 *         required: true
 *         schema:
 *           type: number
 *           example: 1743390000000
 *         description: Timestamp do final do período para análise das faturas.
 *     responses:
 *       200:
 *         description: Retorna a lista de categorias com os valores totais faturados no período informado, o total geral e o intervalo analisado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InvoiceByCategoryAndByPeriodDTO'
 *       400:
 *         description: Parâmetros inválidos ou ausentes. | Parâmetros de entrada inválidos. | Período de pesquisa inválido. Por favor, informe o período de análise. | O valor fornecido para o parâmetro "type" não corresponde a nenhuma categoria válida.
 *       401:
 *         description: Token de autenticação inválido ou ausente.
 *       500:
 *         description: Erro interno no servidor.
 */

export class GetInvoicesByCategoriesAndByPeriodRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getInvoicesByCategoriesAndByPeriodService: GetInvoicesByCategoriesAndByPeriodUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    getInvoicesByCategoriesAndByPeriodService: GetInvoicesByCategoriesAndByPeriodUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new GetInvoicesByCategoriesAndByPeriodRoute(
      'invoice/categories-by-period',
      HttpMethod.GET,
      getInvoicesByCategoriesAndByPeriodService,
      middlewares,
    );
  }

  private handleBuildInputDTO({
    initialDate,
    finalDate,
    paid,
    type,
    authUserId,
  }: Omit<GetInvoicesByCategoryAndPeriodInputDTO, 'period' | 'paid'> & {
    initialDate: string;
    finalDate: string;
    authUserId: string;
    paid?: string;
  }): GetInvoicesByCategoryAndPeriodInputDTO {
    return {
      period: {
        initialDate: Number(initialDate),
        finalDate: Number(finalDate),
      },
      paid: paid === 'true',
      type,
      userId: authUserId,
    };
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user_auth } = request;
        const { initialDate, finalDate, paid, type } = request.query;

        const buildInputDTO = this.handleBuildInputDTO({
          initialDate,
          finalDate,
          paid,
          type,
          authUserId: user_auth?.userId,
        } as unknown as Omit<
          GetInvoicesByCategoryAndPeriodInputDTO,
          'period' | 'paid'
        > & {
          initialDate: string;
          finalDate: string;
          authUserId: string;
          paid?: string;
        });

        const errors =
          await runValidate<GetInvoicesByCategoriesAndPeriodValidationDTO>(
            GetInvoicesByCategoriesAndPeriodValidationDTO,
            {
              initialDate: buildInputDTO.period.initialDate,
              finalDate: buildInputDTO.period.finalDate,
              paid: buildInputDTO.paid,
              type: buildInputDTO.type as unknown as CategoryTypeEnum,
              authUserId: buildInputDTO.userId,
            },
          );

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        const cashFlow =
          await this.getInvoicesByCategoriesAndByPeriodService.execute({
            ...buildInputDTO,
          });

        response.status(200).json({ ...cashFlow });
      } catch (error) {
        console.log('error', error);
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
