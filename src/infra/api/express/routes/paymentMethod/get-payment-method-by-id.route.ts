import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { GetPaymentMethodByIdUseCase } from '@/usecases/payment_method/get-payment-method-by-id.usecase';

/**
 * @swagger
 * /api/payment-method/list-by-id/{id}:
 *   get:
 *     summary: Retorna um método de pagamento pelo ID.
 *     description: Esta rota retorna os detalhes de um método de pagamento específico no sistema, dado o seu ID.
 *     tags:
 *       - PaymentMethod
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do método de pagamento.
 *         schema:
 *           type: string
 *           example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *     responses:
 *       200:
 *         description: Retorna o método de pagamento com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID do método de pagamento.
 *                   example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *                 description:
 *                   type: string
 *                   description: Descrição do método de pagamento.
 *                   example: Cartão de crédito
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Data de criação do método de pagamento.
 *                   example: 2024-01-01T00:00:00Z
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Data de atualização do método de pagamento.
 *                   example: 2024-01-10T12:00:00Z
 *       401:
 *         description: Credenciais inválidas.
 *       404:
 *         description: Método de pagamento não encontrado.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */
export class GetPaymentMethodByIdRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getPaymentMethodByIdService: GetPaymentMethodByIdUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    getPaymentMethodByIdService: GetPaymentMethodByIdUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new GetPaymentMethodByIdRoute(
      'payment-method/list-by-id/:id',
      HttpMethod.GET,
      getPaymentMethodByIdService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { id } = request.params;

        if (!id)
          throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);

        const paymentMethod = await this.getPaymentMethodByIdService.execute({
          id,
        });

        if (!paymentMethod)
          throw new ApiError(ERROR_MESSAGES.PAYMENT_METHOD_NOT_FOUND, 404);

        response.status(200).json({ ...paymentMethod });
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