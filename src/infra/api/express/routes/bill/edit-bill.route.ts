import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { EditBillUseCase } from '@/usecases/bill/edit-bill.usecase';
import { EditBillInputDTO } from '@/domain/Bill/dtos/bill.dto';

/**
 * @swagger
 * /api/bill/edit/{id}:
 *   put:
 *     summary: Edita um dado de conta/despesa cadastrada para o usuário.
 *     description: Esta rota permite a edição um dado de conta/despesa cadastrada para o usuário.
 *     tags:
 *       - Bill
 *     security:
 *       - bearerAuth: []
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
 *                $ref: '#/components/schemas/BillDTO'
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
 *         description: Parâmetros obrigatórios ausentes. | Categoria, Método de Pagamento ou Status de Pagamento inválidos.
 *       401:
 *         description: Credenciais inválidas.
 *       404:
 *         description: Nenhum conta/despesa foi encontrada para o "id" fornecido. Verifique se o identificador está correto.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.
 *       500:
 *         description: Erro interno no servidor.
 */

export class EditBillRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly editBillService: EditBillUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    editBillService: EditBillUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new EditBillRoute(
      'bill/edit/:id',
      HttpMethod.PUT,
      editBillService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { user_auth } = request;
        const { id } = request.params;
        const { payload } = request.body;

        const bill = await this.editBillService.execute({
          billId: id,
          userId: user_auth?.userId,
          billData: payload,
        } as unknown as EditBillInputDTO);

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
