import { GetConsolidatedCashFlowByYearUseCase } from '@/usecases/cash_flow/get-consolidated-cash-flow-by-year.usecase';
import { HttpMiddleware } from '../../middlewares/middleware';
import { HttpMethod, Route } from '../route';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { GetConsolidatedCashFlowByYearInputDTO } from '@/domain/Cash_Flow/dtos/cash-flow.dto';
import { runValidate } from '@/packages/clients/class-validator';
import { GetConsolidatedCashFlowByYearValidationDTO } from '../../schema_validations/CashFlow/cash-flow.schema';

/**
 * @swagger
 * /api/cash-flow/summary/{year}:
 *   get:
 *     summary: Lista de um resumo mensal de fluxo de caixa (entradas, saídas e lucro) com base no ano informado pelo o usuário.
 *     description: Retorna uma lista de resumo mensal de fluxo de caixa (entradas, saídas e lucro) para o ano informado.
 *     tags:
 *       - CashFlow
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: number
 *           example: 2025
 *         description: Ano que deverá ser feita a análise do fluxo de caixa.
 *     responses:
 *       200:
 *         description: Lista do fluxo de caixa consolidado retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/CashFlowDTOListResponse'
 *       400:
 *         description: Período de pesquisa inválido. Por favor, informe o ano corretamente. | Parâmetros de entrada inválidos.
 *       401:
 *         description: Credenciais inválidas.
 *       500:
 *         description: Erro interno no servidor.
 */

export class GetConsolidatedCashFlowByYearRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getConsolidatedCashFlowByYearService: GetConsolidatedCashFlowByYearUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    getConsolidatedCashFlowByYearService: GetConsolidatedCashFlowByYearUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new GetConsolidatedCashFlowByYearRoute(
      'cash-flow/summary/:year',
      HttpMethod.GET,
      getConsolidatedCashFlowByYearService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user_auth } = request;
        const { year } = request.params;

        const errors =
          await runValidate<GetConsolidatedCashFlowByYearValidationDTO>(
            GetConsolidatedCashFlowByYearValidationDTO,
            {
              year: +year,
              authUserId: user_auth?.userId as string,
            },
          );

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        const cashFlow =
          await this.getConsolidatedCashFlowByYearService.execute({
            userId: user_auth?.userId,
            year,
          } as unknown as GetConsolidatedCashFlowByYearInputDTO);

        response.status(200).json({ ...cashFlow });
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
