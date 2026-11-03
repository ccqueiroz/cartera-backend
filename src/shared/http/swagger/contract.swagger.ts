/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       required:
 *         - message
 *         - code
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem em português do catálogo de erros.
 *         code:
 *           type: string
 *           description: Código do erro (ErrorCode).
 *   responses:
 *     Unauthorized:
 *       description: Sessão ausente, inválida ou expirada.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - INVALID_TOKEN
 *                       - TOKEN_EXPIRED
 *     UserDisabled:
 *       description: Usuário desabilitado.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - USER_DISABLED
 *     InternalServerError:
 *       description: Erro interno, inclusive o de infraestrutura e o do body-parser.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - INTERNAL_SERVER_ERROR
 *     ValidationFailed:
 *       description: Dados de entrada inválidos.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - VALIDATION_FAILED
 *     WalletNotFound:
 *       description: Carteira não encontrada.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - WALLET_NOT_FOUND
 */
export {};
