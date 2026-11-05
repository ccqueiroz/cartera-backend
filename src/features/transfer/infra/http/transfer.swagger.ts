/**
 * @swagger
 * components:
 *   schemas:
 *     TransferOutput:
 *       type: object
 *       required: [id, fromWalletId, toWalletId, amount, paymentMethodDescriptionEnum, transferDate, createdAt]
 *       properties:
 *         id: { type: string }
 *         fromWalletId: { type: string }
 *         toWalletId: { type: string }
 *         amount: { type: number }
 *         paymentMethodDescriptionEnum: { $ref: '#/components/schemas/PaymentMethodDescriptionEnum' }
 *         transferDate: { type: string }
 *         createdAt: { type: string }
 *     CreateTransferResult:
 *       type: object
 *       required: [transfer, fromWallet, toWallet, warnings]
 *       properties:
 *         transfer: { $ref: '#/components/schemas/TransferOutput' }
 *         fromWallet: { $ref: '#/components/schemas/WalletBalanceView' }
 *         toWallet: { $ref: '#/components/schemas/WalletBalanceView' }
 *         warnings:
 *           type: array
 *           items: { $ref: '#/components/schemas/BalanceWarning' }
 *   responses:
 *     TransferOutputResponse:
 *       description: Transferência.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data: { $ref: '#/components/schemas/TransferOutput' }
 *     TransferPageResponse:
 *       description: Página de transferências.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data:
 *                 allOf:
 *                   - $ref: '#/components/schemas/PageMeta'
 *                   - type: object
 *                     required: [content]
 *                     properties:
 *                       content:
 *                         type: array
 *                         items: { $ref: '#/components/schemas/TransferOutput' }
 *     CreateTransferResultResponse:
 *       description: Transferência criada com os saldos das carteiras e os avisos.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data: { $ref: '#/components/schemas/CreateTransferResult' }
 *     TransferNotFound:
 *       description: Transferência não encontrada.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - TRANSFER_NOT_FOUND
 *     TransferCreateBadRequest:
 *       description: Payload inválido, mesma carteira, valor não positivo ou data futura.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - TRANSFER_AMOUNT_NOT_POSITIVE
 *                       - TRANSFER_DATE_IN_FUTURE
 *                       - TRANSFER_SAME_WALLET
 *                       - VALIDATION_FAILED
 *     TransferPaymentMethodInactive:
 *       description: Forma de pagamento inativa ou inexistente.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - TRANSFER_PAYMENT_METHOD_INACTIVE
 */
export {};
