import { GetPaymentMethodsUseCase } from '@/usecases/payment_method/get-payment-methods.usecase';
import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

/**
 * @swagger
 * /api/payment-method/list-all:
 *   get:
 *     summary: Retorna uma lista de métodos de pagamento.
 *     description: Esta rota retorna uma lista de métodos de pagamento disponíveis no sistema.
 *     tags:
 *       - PaymentMethod
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
 *                     $ref: '#/components/schemas/PaymentMethodDTO'
 *       401:
 *         description: Credenciais inválidas.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */
export class GetPaymentMethodsRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getPaymentMethodsService: GetPaymentMethodsUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    getPaymentMethodsService: GetPaymentMethodsUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new GetPaymentMethodsRoute(
      'payment-method/list-all',
      HttpMethod.GET,
      getPaymentMethodsService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const paymentMethods = await this.getPaymentMethodsService.execute();

        response.status(200).json({ ...paymentMethods });
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
