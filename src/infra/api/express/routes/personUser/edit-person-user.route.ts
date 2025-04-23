import { EditPersonUserUseCase } from '@/usecases/person_user/edit-person-user.usecase';
import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { Request, Response, NextFunction } from 'express';
import { runValidate } from '@/packages/clients/class-validator';
import { EditPersonUserValidationDTO } from '../../schema_validations/PersonUser/person-user.schema';

/**
 * @swagger
 * /api/person-user/edit/{id}:
 *   put:
 *     summary: Edita dados de um person user
 *     description: Esta rota permite a edição de um person user no sistema.
 *     tags:
 *       - PersonUser
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do usuário a ser editado
 *         schema:
 *           type: string
 *           example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payload:
 *                 $ref: '#/components/schemas/PersonUserDTO'
 *     responses:
 *       200:
 *         description: Dados do person user atualizados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/PersonUserDTO'
 *       400:
 *         description: Parâmetros obrigatórios ausentes. | Parâmetros de entrada inválidos.
 *       401:
 *         description: Credenciais Inválidas.
 *       404:
 *         description: Usuário não encontrado.
 *       429:
 *         description: O acesso a esta conta foi temporariamente desativado...
 *       500:
 *         description: Erro interno no servidor.
 */

export class EditPersonUserRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly EditPersonUserService: EditPersonUserUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    editPersonUserService: EditPersonUserUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new EditPersonUserRoute(
      'person-user/edit/:id',
      HttpMethod.PUT,
      editPersonUserService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { id } = request.params;

        const { payload } = request.body;

        const { email, userId, firstName, lastName } = payload;

        if (!id || !email || !userId || !firstName || !lastName)
          throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);

        const errors = await runValidate(EditPersonUserValidationDTO, {
          id,
          userId,
          email,
          firstName,
          lastName,
        });

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        const personUser = await this.EditPersonUserService.execute({
          personId: id,
          personData: payload,
        });

        response.status(200).json({ ...personUser });
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
