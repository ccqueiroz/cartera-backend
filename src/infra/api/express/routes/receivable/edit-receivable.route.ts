import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { EditReceivableInputDTO } from '@/domain/Receivable/dtos/receivable.dto';
import { EditReceivableUseCase } from '@/usecases/receivable/edit-receivable.usecase';
import { EditReceivableValidationDTO } from '../../schema_validations/Receivable/receivable.schema';
import { runValidate } from '@/packages/clients/class-validator';

/**
 * @swagger
 * /api/receivable/edit/{id}:
 *   put:
 *     summary: Edita um dado de receita cadastrada para o usuário.
 *     description: Esta rota permite a edição um dado de receita cadastrada para o usuário.
 *     tags:
 *       - Receivable
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da receita a ser editada
 *         schema:
 *           type: string
 *           example: e8305798-ccc3-4cb1-8de0-5df4c987a71b
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              payload:
 *                $ref: '#/components/schemas/UpdateReceivableInputDTO'
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
 *         description: Parâmetros obrigatórios ausentes. | Categoria ou Método de Pagamento inválidos. | Parâmetros de entrada inválidos. | Data de pagamento não informada. | Método de pagamento não informado.
 *       401:
 *         description: Credenciais inválidas.
 *       404:
 *         description: Nenhum valor a receber foi encontrado para o "id" fornecido. Verifique se o identificador está correto.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */

export class EditReceivableRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly editReceivableService: EditReceivableUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    editReceivableService: EditReceivableUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new EditReceivableRoute(
      'receivable/edit/:id',
      HttpMethod.PUT,
      editReceivableService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user_auth } = request;
        const { id } = request.params;
        const { payload } = request.body;

        const errors = await runValidate<EditReceivableValidationDTO>(
          EditReceivableValidationDTO,
          {
            id,
            ...payload,
            authUserId: user_auth?.userId,
          },
        );

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        const receivables = await this.editReceivableService.execute({
          receivableId: id,
          userId: user_auth?.userId,
          receivableData: payload,
        } as unknown as EditReceivableInputDTO);

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
