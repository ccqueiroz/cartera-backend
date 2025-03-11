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
 *         description: Retorna a lista de pagamento com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID do método do status.
 *                     example: 0e8f775d-07c1-4ca1-abea-57157ff173b0
 *                   description:
 *                     type: string
 *                     description: Descrição do método do status.
 *                     example: Pago
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Data de criação do método do status.
 *                     example: 2024-01-01T00:00:00Z
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: Data de atualização do método do status.
 *                     example: 2024-01-10T12:00:00Z
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
