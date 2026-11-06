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
 *     PageMeta:
 *       type: object
 *       required:
 *         - page
 *         - size
 *         - totalElements
 *         - totalPages
 *         - ordering
 *       properties:
 *         page:
 *           type: integer
 *         size:
 *           type: integer
 *         totalElements:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         ordering:
 *           type: object
 *           nullable: true
 *           additionalProperties:
 *             type: string
 *             enum:
 *               - asc
 *               - desc
 *     BalanceWarning:
 *       type: string
 *       enum:
 *         - BALANCE_NEGATIVE
 *         - OVERDRAFT_LIMIT_EXCEEDED
 *     WalletBalanceView:
 *       type: object
 *       required:
 *         - id
 *         - balance
 *       properties:
 *         id:
 *           type: string
 *         balance:
 *           type: number
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
 *   parameters:
 *     Page:
 *       name: page
 *       in: query
 *       required: false
 *       schema:
 *         type: integer
 *         minimum: 0
 *     Size:
 *       name: size
 *       in: query
 *       required: false
 *       schema:
 *         type: integer
 *         minimum: 1
 *     DirectionOrder:
 *       name: direction_order
 *       in: query
 *       required: false
 *       schema:
 *         type: string
 *         enum:
 *           - asc
 *           - desc
 *     SortValue:
 *       name: sort_value
 *       in: query
 *       required: false
 *       schema:
 *         type: string
 *     SearchByDateValue:
 *       name: search_by_date_value
 *       in: query
 *       required: false
 *       schema:
 *         type: string
 *         pattern: '^\d{4}-\d{2}-\d{2}(-\d{4}-\d{2}-\d{2})?$'
 */
export {};
