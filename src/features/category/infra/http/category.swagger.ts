/**
 * @swagger
 * components:
 *   schemas:
 *     CategoryOutput:
 *       type: object
 *       required: [description, descriptionEnum, group, type, active, createdAt, updatedAt]
 *       properties:
 *         description: { type: string }
 *         descriptionEnum: { $ref: '#/components/schemas/CategoryDescriptionEnum' }
 *         group: { $ref: '#/components/schemas/CategoryGroupEnum' }
 *         type:
 *           type: string
 *           enum: [BILLS, RECEIVABLES]
 *         active: { type: boolean }
 *         createdAt: { type: string }
 *         updatedAt: { type: string, nullable: true }
 *   responses:
 *     CategoryOutputResponse:
 *       description: Categoria.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data: { $ref: '#/components/schemas/CategoryOutput' }
 *     CategoryListResponse:
 *       description: Lista de categorias.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data:
 *                 type: array
 *                 items: { $ref: '#/components/schemas/CategoryOutput' }
 *     CategoryGroupListResponse:
 *       description: Lista de grupos.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data:
 *                 type: array
 *                 items: { $ref: '#/components/schemas/CategoryGroupEnum' }
 *     CategoryNotFound:
 *       description: Categoria não encontrada.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - CATEGORY_NOT_FOUND
 *     CategoryBadRequest:
 *       description: Payload inválido ou descrição obrigatória ausente.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - CATEGORY_DESCRIPTION_REQUIRED
 *                       - VALIDATION_FAILED
 *     CategoryAlreadyExists:
 *       description: Categoria já ativa para este descriptionEnum.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - CATEGORY_ALREADY_EXISTS
 *     CategoryDescriptionEnumImmutable:
 *       description: Tentativa de trocar o descriptionEnum imutável.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - CATEGORY_DESCRIPTION_ENUM_IMMUTABLE
 */
export {};
