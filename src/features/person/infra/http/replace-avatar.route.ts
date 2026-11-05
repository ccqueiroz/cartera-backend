import { HttpHandler, HttpMethod, Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PersonController } from '@/features/person/infra/http/person.controller';

/**
 * @swagger
 * /api/person/me/avatar:
 *   put:
 *     summary: Substitui o avatar (base64 JPEG/PNG até 5MB, validado por magic bytes).
 *     tags: [Person]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image: { type: string, description: 'Imagem em base64 (com ou sem prefixo data URL)' }
 *     security:
 *       - sessionCookieAuth: []
 *     responses:
 *       200: { $ref: '#/components/responses/PersonOutputResponse' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/UserDisabled' }
 *       404: { $ref: '#/components/responses/PersonNotFound' }
 *       413: { $ref: '#/components/responses/AvatarTooLarge' }
 *       422: { $ref: '#/components/responses/AvatarUnsupportedType' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export class ReplaceAvatarRoute implements Route {
  public readonly method: HttpMethod = 'put';
  public readonly path: string = 'person/me/avatar';
  public readonly handler: HttpHandler;
  // Base64 infla ~33%: 5MB de imagem ≈ 6.7MB de body — limite ampliado só aqui.
  public readonly bodyLimit: string = '8mb';

  private constructor(
    controller: PersonController,
    public readonly middlewares: Middleware[],
  ) {
    // Schema validado no controller via runValidate (assertValid).
    this.handler = controller.replaceAvatar;
  }

  public static create(
    controller: PersonController,
    middlewares: Middleware[],
  ): ReplaceAvatarRoute {
    return new ReplaceAvatarRoute(controller, middlewares);
  }
}
