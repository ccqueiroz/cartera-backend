import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { DeleteReceivableInputDTO } from '@/domain/Receivable/dtos/receivable.dto';
import { DeleteReceivableUseCase } from '@/usecases/receivable/delete-receivable.usecase';
import { runValidate } from '@/packages/clients/class-validator';
import { DeleteReceivableValidationDTO } from '../../schema_validations/Receivable/receivable.schema';

/**
 * @swagger
 * /api/receivable/delete/{id}:
 *   get:
 *     summary: Deleta um item de receita.
 *     description: Esta rota deleta um item de receita cadastrado para o usuário.
 *     tags:
 *       - Receivable
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da receita a ser deletada
 *         schema:
 *           type: string
 *           example: e8305798-ccc3-4cb1-8de0-5df4c987a71b
 *     responses:
 *       204:
 *         description: Receita deletada com sucesso.
 *         content: {}
 *       400:
 *         description: Parâmetros obrigatórios ausentes. | Parâmetros de entrada inválidos.
 *       401:
 *         description: Credenciais inválidas.
 *       404:
 *         description: Nenhum valor a receber foi encontrado para o "id" fornecido. Verifique se o identificador está correto.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */

export class DeleteReceivableRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly deleteReceivableService: DeleteReceivableUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    deleteReceivableService: DeleteReceivableUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new DeleteReceivableRoute(
      'receivable/delete/:id',
      HttpMethod.DELETE,
      deleteReceivableService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user_auth } = request;
        const { id } = request.params;

        const errors = await runValidate<DeleteReceivableValidationDTO>(
          DeleteReceivableValidationDTO,
          {
            id,
            authUserId: user_auth?.userId as string,
          },
        );

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        await this.deleteReceivableService.execute({
          id,
          userId: user_auth?.userId,
        } as unknown as DeleteReceivableInputDTO);

        response.status(204).send();
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
