import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { GetBillByIdInputDTO } from '@/domain/Bill/dtos/bill.dto';
import { GetBillByIdUseCase } from '@/usecases/bill/get-bill-by-id.usecase';

/**
 * @swagger
 * /api/bill/list-by-id/{id}:
 *   get:
 *     summary: Pesquisa um dado de conta/despesa cadastrada para o usuário pelo id.
 *     description: Esta rota permite pesquisar um dado de conta/despesa cadastrada para o usuário pelo id no sistema.
 *     tags:
 *       - Bill
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da conta/despesa a ser pesquisada
 *         schema:
 *           type: string
 *           example: e8305798-ccc3-4cb1-8de0-5df4c987a71b
 *     responses:
 *       200:
 *         description: Dados da conta/despesa cadastrada para o usuário atualizados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                  $ref: '#/components/schemas/BillDTO'
 *       400:
 *         description: Parâmetros obrigatórios ausentes.
 *       401:
 *         description: Credenciais inválidas.
 *       404:
 *         description: Nenhum conta/despesa foi encontrada para o "id" fornecido. Verifique se o identificador está correto.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */

export class GetBillByIdRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getBillByIdService: GetBillByIdUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    getBillByIdService: GetBillByIdUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new GetBillByIdRoute(
      'bill/list-by-id/:id',
      HttpMethod.GET,
      getBillByIdService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user_auth } = request;
        const { id } = request.params;

        const bill = await this.getBillByIdService.execute({
          userId: user_auth?.userId,
          id,
        } as unknown as GetBillByIdInputDTO);

        response.status(200).json({ ...bill });
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
