import { EditBillByPayableMonthUseCase } from '@/usecases/bill/edit-bill-by-payable-month.usecase';
import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { NextFunction, Request, Response } from 'express';
import { runValidate } from '@/packages/clients/class-validator';
import { EditBillByPayableMonthValidationDTO } from '../../schema_validations/Bill/bill.schema';
import { EditBillByPayableMonthInputDTO } from '@/domain/Bill/dtos/bill.dto';

/**
 * @swagger
 * /api/bill/edit/payable-month/{id}:
 *   put:
 *     summary: Adiciona a data de pagamento de uma conta.
 *     description: Esta rota permite a adição da data de pagamento de uma conta.
 *     tags:
 *       - Bill
 *     security:
 *       - sessionCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da conta/despesa a ser editada
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
 *                $ref: '#/components/schemas/UpdateBillByPayableMonthDTO'
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
 *         description: Parâmetros obrigatórios ausentes. | Categoria ou Método de Pagamento inválidos. | Parâmetros de entrada inválidos. | Conta já "Descrição da conta" foi paga. Para alterar os status da conta. Por favor, Acesse a sessão de "Pagamentos". | Data de pagamento não informada. | A data de pagamento não pode ser anterior à data de criação da conta, Por favor, Acesse a sessão de "Pagamentos". | Método de pagamento não informado.
 *       401:
 *         description: Credenciais inválidas.
 *       404:
 *         description: Nenhum conta/despesa foi encontrada para o "id" fornecido. Verifique se o identificador está correto.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */

export class EditBillByPayableMonthRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly editBillByPayableMonthService: EditBillByPayableMonthUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    editBillByPayableMonthService: EditBillByPayableMonthUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new EditBillByPayableMonthRoute(
      'bill/edit/payable-month/:id',
      HttpMethod.PUT,
      editBillByPayableMonthService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user_auth } = request;
        const { id } = request.params;
        const { payload } = request.body;

        const errors = await runValidate<EditBillByPayableMonthValidationDTO>(
          EditBillByPayableMonthValidationDTO,
          {
            id,
            ...payload,
            authUserId: user_auth?.userId as string,
          },
        );

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        const bill = await this.editBillByPayableMonthService.execute({
          billId: id,
          userId: user_auth?.userId,
          billData: payload,
        } as unknown as EditBillByPayableMonthInputDTO);

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
