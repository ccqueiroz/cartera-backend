/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentStatusCatalogOutput:
 *       type: object
 *       required: [id, code, label]
 *       properties:
 *         id: { type: string }
 *         code: { $ref: '#/components/schemas/PaymentStatusDescriptionEnum' }
 *         label: { type: string }
 *   responses:
 *     PaymentStatusOutputResponse:
 *       description: Status de pagamento do catálogo.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data: { $ref: '#/components/schemas/PaymentStatusCatalogOutput' }
 *     PaymentStatusListResponse:
 *       description: Lista de status de pagamento do catálogo.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data:
 *                 type: array
 *                 items: { $ref: '#/components/schemas/PaymentStatusCatalogOutput' }
 *     PaymentStatusNotFound:
 *       description: Status de pagamento não encontrado.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - PAYMENT_STATUS_NOT_FOUND
 */
export {};
