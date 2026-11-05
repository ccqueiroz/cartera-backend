/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterAccountOutput:
 *       type: object
 *       required: [email, userId, firstName, lastName, fullName, id, createdAt, updatedAt, accessToken, refreshToken, expirationTime]
 *       properties:
 *         email: { type: string }
 *         userId: { type: string }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         fullName: { type: string }
 *         id: { type: string }
 *         createdAt: { type: string }
 *         updatedAt: { type: string, nullable: true }
 *         accessToken: { type: string }
 *         refreshToken: { type: string }
 *         expirationTime: { type: string }
 *   responses:
 *     RegisterAccountOutputResponse:
 *       description: Conta e perfil criados, com os tokens no corpo e o cookie session definido.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data: { $ref: '#/components/schemas/RegisterAccountOutput' }
 *     AuthBadRequest:
 *       description: E-mail inválido ou campo obrigatório ausente.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - INVALID_EMAIL
 *                       - VALIDATION_FAILED
 *     RegisterUnauthorized:
 *       description: Falha do provedor de autenticação no registro.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - ACCOUNT_NOT_FOUND
 *                       - INTERNAL_SERVER_ERROR
 *                       - INVALID_CREDENTIALS
 *                       - INVALID_EMAIL
 *                       - TOO_MANY_REQUESTS
 *     RegisterConflict:
 *       description: E-mail já em uso ou perfil já existente.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - EMAIL_ALREADY_IN_USE
 *                       - PERSON_ALREADY_EXISTS
 */
export {};
