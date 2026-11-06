/**
 * @swagger
 * components:
 *   schemas:
 *     WalletOutput:
 *       type: object
 *       required: [id, name, balance, isDefault, effectiveBalance, overdraftUsed, overdraftAvailable, availableBalance, accruedInterest, amountToPay, overdraft, active, createdAt, updatedAt]
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         balance: { type: number }
 *         isDefault: { type: boolean }
 *         effectiveBalance: { type: number }
 *         overdraftUsed: { type: number }
 *         overdraftAvailable: { type: number }
 *         availableBalance: { type: number }
 *         accruedInterest: { type: number }
 *         amountToPay: { type: number }
 *         overdraft:
 *           type: object
 *           nullable: true
 *           required: [limit, monthlyRate, graceDays, since]
 *           properties:
 *             limit: { type: number }
 *             monthlyRate: { type: number }
 *             graceDays: { type: number }
 *             since: { type: string, nullable: true }
 *         active: { type: boolean }
 *         createdAt: { type: string }
 *         updatedAt: { type: string, nullable: true }
 *     CreateWalletResult:
 *       type: object
 *       required: [wallet, warnings]
 *       properties:
 *         wallet: { $ref: '#/components/schemas/WalletOutput' }
 *         warnings:
 *           type: array
 *           items: { $ref: '#/components/schemas/BalanceWarning' }
 *     WalletMovementOutput:
 *       type: object
 *       required: [id, walletId, direction, amount, refType, refId, occurredAt, createdAt]
 *       properties:
 *         id: { type: string }
 *         walletId: { type: string }
 *         direction: { type: string, enum: [DEBIT, CREDIT] }
 *         amount: { type: number }
 *         refType:
 *           type: string
 *           enum:
 *             - SETTLEMENT
 *             - SETTLEMENT_REVERSAL
 *             - TRANSFER
 *             - INVOICE
 *             - YIELD
 *             - ADJUST
 *             - OVERDRAFT_INTEREST
 *         refId: { type: string, nullable: true }
 *         occurredAt: { type: string }
 *         createdAt: { type: string }
 *     AdjustBalanceResult:
 *       type: object
 *       required: [wallet, movements, warnings]
 *       properties:
 *         wallet: { $ref: '#/components/schemas/WalletOutput' }
 *         movements:
 *           type: array
 *           items: { $ref: '#/components/schemas/WalletMovementOutput' }
 *         warnings:
 *           type: array
 *           items: { $ref: '#/components/schemas/BalanceWarning' }
 *   responses:
 *     WalletOutputResponse:
 *       description: Carteira.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data: { $ref: '#/components/schemas/WalletOutput' }
 *     WalletPageResponse:
 *       description: Página de carteiras.
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
 *                         items: { $ref: '#/components/schemas/WalletOutput' }
 *     WalletMovementPageResponse:
 *       description: Página de movimentos do extrato.
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
 *                         items: { $ref: '#/components/schemas/WalletMovementOutput' }
 *     WalletDeleteRefused:
 *       description: Remoção recusada para a carteira.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - WALLET_HAS_BALANCE
 *                       - WALLET_NOT_DELETABLE
 *     CreateWalletResultResponse:
 *       description: Carteira criada com os avisos de saldo.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data: { $ref: '#/components/schemas/CreateWalletResult' }
 *     WalletCreateBadRequest:
 *       description: Payload inválido ou saldo negativo sem limite.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - MONEY_NEGATIVE
 *                       - OVERDRAFT_LIMIT_REQUIRED
 *                       - VALIDATION_FAILED
 *                       - WALLET_NAME_REQUIRED
 *     WalletEditBadRequest:
 *       description: Payload inválido na edição da carteira.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - OVERDRAFT_LIMIT_REQUIRED
 *                       - VALIDATION_FAILED
 *                       - WALLET_NAME_REQUIRED
 *     WalletDeleted:
 *       description: Carteira removida.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - WALLET_DELETED
 *     WalletDefaultNoOverdraft:
 *       description: Carteira padrão não aceita cheque especial.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - WALLET_DEFAULT_NO_OVERDRAFT
 *     AdjustBalanceResultResponse:
 *       description: Saldo ajustado com os movimentos e os avisos.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data: { $ref: '#/components/schemas/AdjustBalanceResult' }
 *     WalletAdjustBadRequest:
 *       description: Valor inválido ou saldo negativo sem limite.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - properties:
 *                   code:
 *                     enum:
 *                       - MONEY_NEGATIVE
 *                       - VALIDATION_FAILED
 */
export {};
