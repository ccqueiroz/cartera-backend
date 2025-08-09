import { GetMonthlySummaryCashFlowUseCase } from '@/usecases/cash_flow/get-monthly-summary-cash-flow.usecase';
import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { GetMonthlySummaryCashFlowInputDTO } from '@/domain/Cash_Flow/dtos/cash-flow.dto';
import { NextFunction, Request, Response } from 'express';
import { runValidate } from '@/packages/clients/class-validator';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { GetMonthlySummaryCashFlowValidationDTO } from '../../schema_validations/CashFlow/cash-flow.schema';

/**
 * @swagger
 * /api/cash-flow/monthly-summary/{month}/{year}:
 *   get:
 *     summary: Resumo mensal do fluxo de caixa detalhado por mês e ano.
 *     description: Resumo mensal do fluxo de caixa com receitas fixas e variáveis recebidas e despesas fixas e variáveis pagas, filtrado por mês (0-11) e ano.
 *     tags:
 *       - CashFlow
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: number
 *           example: 7
 *         description: Mês para o qual será feita a análise do fluxo de caixa. Esse valor corresponde ao resultado do método `getMonth()` do JavaScript aplicado em um objeto `Date`, portanto varia de 0 (janeiro) a 11 (dezembro).
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: number
 *           example: 2025
 *         description: Ano que deverá ser feita a análise do fluxo de caixa.
 *     responses:
 *       200:
 *         description: Resumo mensal do fluxo de caixa retornado com sucesso, incluindo receitas fixas e variáveis, bem como despesas fixas e variáveis pagas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                  $ref: '#/components/schemas/GetMonthlySummaryCashFlowDTO'
 *       400:
 *         description: Período de pesquisa inválido. Por favor, informe o ano corretamente. | Parâmetros de entrada inválidos.
 *       401:
 *         description: Credenciais inválidas.
 *       500:
 *         description: Erro interno no servidor.
 */

export class GetMonthlySummaryCashFlowRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getMonthlySummaryCashFlowService: GetMonthlySummaryCashFlowUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    getMonthlySummaryCashFlowService: GetMonthlySummaryCashFlowUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new GetMonthlySummaryCashFlowRoute(
      'cash-flow/monthly-summary/:month/:year',
      HttpMethod.GET,
      getMonthlySummaryCashFlowService,
      middlewares,
    );
  }

  private handleBuildInputDTO({
    year,
    month,
    paid,
    authUserId,
  }: GetMonthlySummaryCashFlowInputDTO & {
    authUserId: string;
  }): GetMonthlySummaryCashFlowInputDTO {
    return {
      year: Number(year),
      month: Number(month),
      userId: authUserId,
      paid,
    };
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user_auth } = request;
        const { year } = request.params;

        const cashFlowInputDTO = this.handleBuildInputDTO({
          year,
          authUserId: user_auth?.userId,
        } as unknown as GetMonthlySummaryCashFlowInputDTO & {
          authUserId: string;
        });

        const errors =
          await runValidate<GetMonthlySummaryCashFlowValidationDTO>(
            GetMonthlySummaryCashFlowValidationDTO,
            {
              year: cashFlowInputDTO.year,
              month: cashFlowInputDTO.month,
              authUserId: cashFlowInputDTO.userId,
              paid: cashFlowInputDTO.paid,
            },
          );

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        const cashFlow = await this.getMonthlySummaryCashFlowService.execute({
          ...cashFlowInputDTO,
        });

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
