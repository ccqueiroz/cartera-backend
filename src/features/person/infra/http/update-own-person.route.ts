import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PersonController } from '@/features/person/infra/http/person.controller';

/**
 * @swagger
 * /api/person/me:
 *   patch:
 *     summary: Edita o perfil do usuário autenticado (email e avatar excluídos).
 *     tags: [Person]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               phone:
 *                 type: object
 *                 nullable: true
 *                 properties:
 *                   number: { type: string }
 *                   countryCode: { type: string }
 *                   isWhatsapp: { type: boolean }
 *               document:
 *                 type: object
 *                 nullable: true
 *                 properties:
 *                   type: { type: string, enum: [CPF, CNPJ] }
 *                   value: { type: string, description: 'Cru, sem máscara' }
 *               birthDate: { type: string, format: date, nullable: true }
 *               occupation: { type: string, nullable: true }
 *               monthlyIncome:
 *                 type: object
 *                 properties:
 *                   value: { type: number, nullable: true }
 *                   currency: { type: string, nullable: true }
 *               defaultCurrency: { type: string, nullable: true }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200:
 *         description: Perfil atualizado com document re-mascarado.
 *       400:
 *         description: Payload inválido.
 *       401:
 *         description: Sessão ausente ou inválida.
 *       404:
 *         description: Perfil não encontrado.
 *       409:
 *         description: Documento já em uso por outro perfil.
 *       422:
 *         description: Documento/telefone inválido para o tipo declarado.
 */
export class UpdateOwnPersonRoute implements Route {
  public readonly method: HttpMethod = 'patch';
  public readonly path: string = 'person/me';
  public readonly handler: HttpHandler;

  private constructor(
    controller: PersonController,
    public readonly middlewares: Middleware[],
  ) {
    // Schema validado no controller via runValidate (assertValid).
    this.handler = controller.updateOwn;
  }

  public static create(
    controller: PersonController,
    middlewares: Middleware[],
  ): UpdateOwnPersonRoute {
    return new UpdateOwnPersonRoute(controller, middlewares);
  }
}
