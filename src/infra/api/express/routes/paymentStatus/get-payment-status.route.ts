import { GetPaymentStatusUseCase } from '@/usecases/payment_status/get-payment-status.usecase';
import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

/**
 * @swagger
 * /api/payment-status/list-all:
 *   get:
 *     summary: Retorna uma lista de status.
 *     description: Esta rota retorna uma lista de status disponíveis no sistema.
 *     tags:
 *       - PaymentStatus
 *     security:
 *       - bearerAuth: []
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
 *                     $ref: '#/components/schemas/PaymentStatusDTO'
 *       401:
 *         description: Credenciais inválidas.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */
export class GetPaymentStatusRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getPaymentStatusService: GetPaymentStatusUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    getPaymentStatusService: GetPaymentStatusUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new GetPaymentStatusRoute(
      'payment-status/list-all',
      HttpMethod.GET,
      getPaymentStatusService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const paymentStatus = await this.getPaymentStatusService.execute();

        response.status(200).json({ ...paymentStatus });
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
