import { HttpMiddleware } from '../../middlewares/middleware';
import { HttpMethod, Route } from '../route';
import { NextFunction, Request, Response } from 'express';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { runValidate } from '@/packages/clients/class-validator';
import { GetPersonUserByUserIdValidationDTO } from '../../schema_validations/PersonUser/person-user.schema';
import { GetPersonUserByUserIdlUseCase } from '@/usecases/person_user/get-person-user-by-user-id.usecase';

/**
 * @swagger
 * /api/person-user/list-by-user-id/{id}:
 *   get:
 *     summary: Edita dados de um person user
 *     description: Esta rota retorna os dados de um person user com base no ID do usuário.
 *     tags:
 *       - PersonUser
 *     security:
 *       - sessionCookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID do usuário a ser pesquisado
 *         schema:
 *           type: string
 *           example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *     responses:
 *       200:
 *         description: Retorna o person user com sucesso.
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

export class GetPersonUserByUserIdRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly getPersonUserByUserIdService: GetPersonUserByUserIdlUseCase,
    private readonly middlewares: Array<HttpMiddleware> = [],
  ) {}

  public static create(
    getPersonUserByUserIdService: GetPersonUserByUserIdlUseCase,
    middlewares: Array<HttpMiddleware> = [],
  ) {
    return new GetPersonUserByUserIdRoute(
      'person-user/list-by-user-id/:id',
      HttpMethod.GET,
      getPersonUserByUserIdService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { id } = request.params;

        if (!id)
          throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);

        const errors = await runValidate(GetPersonUserByUserIdValidationDTO, {
          id,
        });

        if (errors?.length > 0) {
          throw new ApiError(ERROR_MESSAGES.INVALID_PARAMETERS, 400);
        }

        const personUser = await this.getPersonUserByUserIdService.execute({
          userId: id,
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
