import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { GetReceivableByIdUseCase } from '@/usecases/receivable/get-receivable-by-id.usecase';
import { GetReceivableByIdInputDTO } from '@/domain/Receivable/dtos/receivable.dto';

/**
 * @swagger
 * /api/receivable/list-by-id/{id}:
 *   get:
 *     summary: Pesquisa um dado de receita cadastrada para o usuário pelo id.
 *     description: Esta rota permite pesquisar um dado de receita cadastrada para o usuário pelo id no sistema.
 *     tags:
 *       - Receivable
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da receita a ser pesquisada
 *         schema:
 *           type: string
 *           example: e8305798-ccc3-4cb1-8de0-5df4c987a71b
 *     responses:
 *       200:
 *         description: Dados da receita cadastrada para o usuário atualizados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                  $ref: '#/components/schemas/ReceivableDTO'
 *       400:
 *         description: Parâmetros obrigatórios ausentes.
 *       401:
 *         description: Credenciais inválidas.
 *       404:
 *         description: Nenhum valor a receber foi encontrado para o "id" fornecido. Verifique se o identificador está correto.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */

export class GetReceivableByIdRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getReceivableByIdService: GetReceivableByIdUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    getReceivableByIdService: GetReceivableByIdUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new GetReceivableByIdRoute(
      'receivable/list-by-id/:id',
      HttpMethod.GET,
      getReceivableByIdService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user_auth } = request;
        const { id } = request.params;

        const receivables = await this.getReceivableByIdService.execute({
          userId: user_auth?.userId,
          id,
        } as unknown as GetReceivableByIdInputDTO);

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
