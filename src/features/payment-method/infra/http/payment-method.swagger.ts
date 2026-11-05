/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentMethodOutput:
 *       type: object
 *       required: [id, description, descriptionEnum, active, createdAt, updatedAt]
 *       properties:
 *         id: { type: string }
 *         description: { type: string }
 *         descriptionEnum: { $ref: '#/components/schemas/PaymentMethodDescriptionEnum' }
 *         active: { type: boolean }
 *         createdAt: { type: string }
 *         updatedAt: { type: string, nullable: true }
 *   responses:
 *     PaymentMethodOutputResponse:
 *       description: Forma de pagamento.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data: { $ref: '#/components/schemas/PaymentMethodOutput' }
 *     PaymentMethodListResponse:
 *       description: Lista de formas de pagamento.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data:
 *                 type: array
 *                 items: { $ref: '#/components/schemas/PaymentMethodOutput' }
 *     PaymentMethodNotFound:
 *       description: Forma de pagamento não encontrada.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - PAYMENT_METHOD_NOT_FOUND
 */
export {};
