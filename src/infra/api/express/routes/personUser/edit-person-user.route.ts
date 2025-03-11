import { EditPersonUserUseCase } from '@/usecases/person_user/edit-person-user.usecase';
import { HttpMethod, Route } from '../route';
import { HttpMiddleware } from '../../middlewares/middleware';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { Request, Response, NextFunction } from 'express';

/**
 * @swagger
 * /api/person-user/edit/{personUserId}:
 *   put:
 *     summary: Edita dados de um person user
 *     description: Esta rota permite a edição de um person user no sistema.
 *     tags:
 *       - PersonUser
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: personUserId
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
 *               userId:
 *                 type: string
 *                 description: ID do usuário vinculado
 *                 example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *               firstName:
 *                 type: string
 *                 description: Primeiro nome do usuário
 *                 example: John
 *               lastName:
 *                 type: string
 *                 description: Último nome do usuário
 *                 example: Doe
 *               email:
 *                 type: string
 *                 description: E-mail do usuário
 *                 example: usuario@example.com
 *               image:
 *                 type: string
 *                 description: URL da imagem do perfil (opcional)
 *                 example: https://example.com/profile.jpg
 *     responses:
 *       201:
 *         description: Dados do person user atualizados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID do registro atualizado
 *                   example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *                 userId:
 *                   type: string
 *                   description: ID do usuário vinculado
 *                   example: PnAvaiVeApVMDZz21lKG94gU1fJ3
 *                 firstName:
 *                   type: string
 *                   example: John
 *                 lastName:
 *                   type: string
 *                   example: Doe
 *                 email:
 *                   type: string
 *                   example: usuario@example.com
 *                 fullName:
 *                   type: string
 *                   example: John Doe
 *                 image:
 *                   type: string
 *                   example: https://example.com/profile.jpg
 *                 createdAt:
 *                   type: string
 *                   example: 2024-01-01T00:00:00Z
 *                 updatedAt:
 *                   type: string
 *                   example: 2024-01-10T12:00:00Z
 *       400:
 *         description: Parâmetros obrigatórios ausentes.
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
      'person-user/edit/:personUserId',
      HttpMethod.PUT,
      editPersonUserService,
      middlewares,
    );
  }

  public getHandler() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { personUserId } = request.params;

        const { payload } = request.body;

        const { email, userId, firstName, lastName } = payload;

        if (!personUserId || !email || !userId || !firstName || !lastName)
          throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);

        const personUser = await this.EditPersonUserService.execute({
          personId: personUserId,
          personData: payload,
        });

        response.status(201).json({ ...personUser });
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
