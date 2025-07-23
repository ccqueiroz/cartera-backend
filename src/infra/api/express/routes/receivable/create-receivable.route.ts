import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { CreateReceivableInputDTO } from '@/domain/Receivable/dtos/receivable.dto';
import { CreateReceivableUseCase } from '@/usecases/receivable/create-receivable.usecase';
import { runValidate } from '@/packages/clients/class-validator';
import { CreateReceivableValidationDTO } from '../../schema_validations/Receivable/receivable.schema';

/**
 * @swagger
 * /api/receivable/create:
 *   post:
 *     summary: Cria um dado de receita para o usuário.
 *     description: Esta rota permite a criação de um dado de receita para o usuário.
 *     tags:
 *       - Receivable
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              payload:
 *                $ref: '#/components/schemas/CreateReceivableInputDTO'
 *     responses:
 *       201:
 *         description: Dados da receita cadastrada para o usuário com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: e8305798-ccc3-4cb1-8de0-5df4c987a71b
 *       400:
 *         description: Categoria ou Método de Pagamento inválidos. | Parâmetros de entrada inválidos. | Data de pagamento não informada. | Método de pagamento não informado.
 *       401:
 *         description: Credenciais inválidas.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */

export class CreateReceivableRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly createReceivableService: CreateReceivableUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    createReceivableService: CreateReceivableUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new CreateReceivableRoute(
      'receivable/create',
      HttpMethod.POST,
      createReceivableService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user_auth } = request;
        const { payload } = request.body;

        const errors = await runValidate<CreateReceivableValidationDTO>(
          CreateReceivableValidationDTO,
          {
            ...payload,
            authUserId: user_auth?.userId,
          },
        );

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        const receivables = await this.createReceivableService.execute({
          userId: user_auth?.userId,
          receivableData: payload,
        } as unknown as CreateReceivableInputDTO);

        response.status(201).json({ ...receivables });
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
