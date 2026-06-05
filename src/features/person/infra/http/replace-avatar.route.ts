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
 *     responses:
 *       200:
 *         description: Avatar substituído; avatarUrl atualizado.
 *       400:
 *         description: Payload inválido.
 *       401:
 *         description: Sessão ausente ou inválida.
 *       404:
 *         description: Perfil não encontrado.
 *       413:
 *         description: Imagem decodificada acima de 5MB.
 *       422:
 *         description: Conteúdo não é JPEG nem PNG.
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
