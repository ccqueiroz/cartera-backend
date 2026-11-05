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
 *     AuthSession:
 *       type: object
 *       required: [userId, email, accessToken, refreshToken, expirationTime]
 *       properties:
 *         userId: { type: string }
 *         email: { type: string }
 *         accessToken: { type: string }
 *         refreshToken: { type: string }
 *         expirationTime: { type: string }
 *     RefreshedAuthSession:
 *       type: object
 *       required: [userId, accessToken, refreshToken, expirationTime]
 *       properties:
 *         userId: { type: string }
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
 *     AuthSessionResponse:
 *       description: Sessão criada, com os tokens no corpo e o cookie session definido.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data: { $ref: '#/components/schemas/AuthSession' }
 *     RefreshedAuthSessionResponse:
 *       description: Sessão renovada, com os novos tokens no corpo e o cookie session atualizado.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data: { $ref: '#/components/schemas/RefreshedAuthSession' }
 *     LoginUnauthorized:
 *       description: Credenciais inválidas, limite de tentativas ou falha do provedor no login.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - INTERNAL_SERVER_ERROR
 *                       - INVALID_CREDENTIALS
 *                       - TOO_MANY_REQUESTS
 *     LoginForbidden:
 *       description: Conta encerrada ou suspensa.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - ACCOUNT_DELETED
 *                       - USER_DISABLED
 *     RefreshUnauthorized:
 *       description: Refresh token inválido, expirado ou revogado; exige relogin.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - INTERNAL_SERVER_ERROR
 *                       - INVALID_TOKEN
 */
export {};
