/**
 * @swagger
 * components:
 *   schemas:
 *     PersonOutput:
 *       type: object
 *       required: [id, userId, email, firstName, lastName, fullName, phone, document, avatarUrl, birthDate, occupation, monthlyIncome, defaultCurrency, isActive, createdAt, updatedAt, deletedAt]
 *       properties:
 *         id: { type: string }
 *         userId: { type: string }
 *         email: { type: string }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         fullName: { type: string }
 *         phone:
 *           type: object
 *           nullable: true
 *           required: [number, countryCode, isWhatsapp]
 *           properties:
 *             number: { type: string }
 *             countryCode: { type: string }
 *             isWhatsapp: { type: boolean }
 *         document:
 *           type: object
 *           nullable: true
 *           required: [type, value]
 *           properties:
 *             type: { type: string, enum: [CPF, CNPJ] }
 *             value: { type: string }
 *         avatarUrl: { type: string, nullable: true }
 *         birthDate: { type: string, nullable: true }
 *         occupation: { type: string, nullable: true }
 *         monthlyIncome:
 *           type: object
 *           required: [value, currency]
 *           properties:
 *             value: { type: number, nullable: true }
 *             currency: { type: string, nullable: true }
 *         defaultCurrency: { type: string, nullable: true }
 *         isActive: { type: boolean }
 *         createdAt: { type: string }
 *         updatedAt: { type: string, nullable: true }
 *         deletedAt: { type: string, nullable: true }
 *   responses:
 *     PersonOutputResponse:
 *       description: Perfil com fullName e isActive computados e o document mascarado.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data: { $ref: '#/components/schemas/PersonOutput' }
 *     PersonNotFound:
 *       description: Perfil não encontrado.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - PERSON_NOT_FOUND
 *     PersonDocumentInUse:
 *       description: Documento já em uso por outro perfil.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - DOCUMENT_ALREADY_IN_USE
 *     PersonUpdateRefused:
 *       description: Documento ou telefone inválido para o tipo declarado.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - DOCUMENT_TYPE_MISMATCH
 *                       - INVALID_DOCUMENT
 *                       - INVALID_PHONE
 *     AvatarTooLarge:
 *       description: Imagem decodificada acima de 5MB.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - AVATAR_TOO_LARGE
 *     AvatarUnsupportedType:
 *       description: Conteúdo não é JPEG nem PNG.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - AVATAR_UNSUPPORTED_TYPE
 */
export {};
