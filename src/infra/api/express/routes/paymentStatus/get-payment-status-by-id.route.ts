import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { GetPaymentStatusByIdUseCase } from '@/usecases/payment_status/get-payment-status-by-id.usecase';

/**
 * @swagger
 * /api/payment-status/list-by-id/{id}:
 *   get:
 *     summary: Retorna um status pelo ID.
 *     description: Esta rota retorna os detalhes de um status específico no sistema, dado o seu ID.
 *     tags:
 *       - PaymentStatus
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: 0e8f775d-07c1-4ca1-abea-57157ff173b0
 *     responses:
 *       200:
 *         description: Retorna o status com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                  $ref: '#/components/schemas/PaymentStatusDTO'
 *       401:
 *         description: Credenciais inválidas.
 *       404:
 *         description: Status não encontrado.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */
export class GetPaymentStatusByIdRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getPaymentStatusByIdService: GetPaymentStatusByIdUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    getPaymentStatusByIdService: GetPaymentStatusByIdUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new GetPaymentStatusByIdRoute(
      'payment-status/list-by-id/:id',
      HttpMethod.GET,
      getPaymentStatusByIdService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { id } = request.params;

        if (!id)
          throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);

        const paymentStatus = await this.getPaymentStatusByIdService.execute({
          id,
        });

        if (!paymentStatus)
          throw new ApiError(ERROR_MESSAGES.PAYMENT_STATUS_NOT_FOUND, 404);

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
