import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { runValidate } from '@/packages/clients/class-validator';
import { GetReceivablesByMonthUseCase } from '@/usecases/receivable/get-receivables-by-month.usecase';
import { GetReceivablesByMonthDTO } from '../../schema_validations/Receivable/receivable.schema';
import { ReceivablesByMonthInputDTO } from '@/domain/Receivable/dtos/receivable.dto';

/**
 * @swagger
 * /api/receivable/by-month-status:
 *   get:
 *     summary: Lista todas as receitas cadastradas no mês para o usuário com filtro por período.
 *     description:
 *       Retorna uma lista todas as receitas cadastradas no mês para o usuário com filtro por período.
 *     tags:
 *       - Receivable
 *     security:
 *       - sessionCookieAuth: []
 *     parameters:
 *       - in: query
 *         name: initialDate
 *         required: true
 *         schema:
 *           type: number
 *           example: 1740798000000
 *         description: Timestamp do início do período para análise da receita.
 *       - in: query
 *         name: finalDate
 *         required: true
 *         schema:
 *           type: number
 *           example: 1743390000000
 *         description: Timestamp do final do período para análise da receita.
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
 *         description: Lista de receitas retornada com sucesso.
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
 *                        $ref: '#/components/schemas/ReceivablesByMonthOutPutDTO'
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

export class GetReceivablesByMonthRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getReceivablesByMonthService: GetReceivablesByMonthUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    getReceivablesByMonthService: GetReceivablesByMonthUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new GetReceivablesByMonthRoute(
      'receivable/by-month-status',
      HttpMethod.GET,
      getReceivablesByMonthService,
      middlewares,
    );
  }

  private handleBuildInputDTO({
    page,
    size,
    authUserId,
    initialDate,
    finalDate,
  }: Omit<ReceivablesByMonthInputDTO, 'period'> & {
    initialDate: string;
    finalDate: string;
    authUserId: string;
  }): ReceivablesByMonthInputDTO {
    return {
      period: {
        initialDate: Number(initialDate),
        finalDate: Number(finalDate),
      },
      userId: authUserId,
      page: Number(page),
      size: Number(size),
    };
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user_auth } = request;
        const { initialDate, finalDate, page, size } = request.query;

        const buildInputDTO = this.handleBuildInputDTO({
          initialDate,
          finalDate,
          authUserId: user_auth?.userId,
          page,
          size,
        } as unknown as Omit<ReceivablesByMonthInputDTO, 'period'> & {
          initialDate: string;
          finalDate: string;
          authUserId: string;
        });

        const errors = await runValidate<GetReceivablesByMonthDTO>(
          GetReceivablesByMonthDTO,
          {
            initialDate: buildInputDTO.period.initialDate,
            finalDate: buildInputDTO.period.finalDate,
            authUserId: buildInputDTO.userId,
            page: buildInputDTO.page,
            size: buildInputDTO.size,
          },
        );

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        const receivables = await this.getReceivablesByMonthService.execute({
          ...buildInputDTO,
        });

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
