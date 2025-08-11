import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { DeleteBillUseCase } from '@/usecases/bill/delete-bill.usecase';
import { DeleteBillInputDTO } from '@/domain/Bill/dtos/bill.dto';
import { runValidate } from '@/packages/clients/class-validator';
import { DeleteBillValidationDTO } from '../../schema_validations/Bill/bill.schema';

/**
 * @swagger
 * /api/bill/delete/{id}:
 *   get:
 *     summary: Deleta um item de conta/despesa.
 *     description: Esta rota deleta um item de conta/despesa cadastrado para o usuário.
 *     tags:
 *       - Bill
 *     security:
 *       - sessionCookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da conta/despesa a ser deletada
 *         schema:
 *           type: string
 *           example: e8305798-ccc3-4cb1-8de0-5df4c987a71b
 *     responses:
 *       204:
 *         description: conta/despesa deletada com sucesso.
 *         content: {}
 *       400:
 *         description: Parâmetros obrigatórios ausentes. | Parâmetros de entrada inválidos.
 *       401:
 *         description: Credenciais inválidas.
 *       404:
 *         description: Nenhum conta/despesa foi encontrada para o "id" fornecido. Verifique se o identificador está correto.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */

export class DeleteBillRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly deleteBillService: DeleteBillUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    deleteBillService: DeleteBillUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new DeleteBillRoute(
      'bill/delete/:id',
      HttpMethod.DELETE,
      deleteBillService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user_auth } = request;
        const { id } = request.params;

        const errors = await runValidate<DeleteBillValidationDTO>(
          DeleteBillValidationDTO,
          {
            id,
            authUserId: user_auth?.userId as string,
          },
        );

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        await this.deleteBillService.execute({
          id,
          userId: user_auth?.userId,
        } as unknown as DeleteBillInputDTO);

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
