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
 */
export {};
