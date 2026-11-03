/**
 * @swagger
 * components:
 *   schemas:
 *     TransactionOutput:
 *       type: object
 *       required: [id, parentId, rootId, userId, personId, type, amount, currentAmount, paidAmount, dueDate, paymentDate, paid, paymentStatus, paymentMethodDescriptionEnum, refMonthDueDate, refYearDueDate, refMonthPaymentDate, refYearPaymentDate, totalInterest, paymentVariance, effectiveRate, paidInstallmentsCount, firstInstallment, categoryDescriptionEnum, categoryGroup, isFixedCost, period, frequency, rootIsFixedCost, rootHasInstallments, hasChildren, origin, reversed, deleted, createdAt]
 *       properties:
 *         id: { type: string }
 *         parentId: { type: string, nullable: true }
 *         rootId: { type: string }
 *         userId: { type: string }
 *         personId: { type: string }
 *         type: { type: string, enum: [BILLS, RECEIVABLES] }
 *         amount: { type: number }
 *         currentAmount: { type: number }
 *         paidAmount: { type: number }
 *         dueDate: { type: string }
 *         paymentDate: { type: string, nullable: true }
 *         paid: { type: boolean }
 *         paymentStatus: { type: string, enum: [PAID, RECEIVED, TO_PAY, TO_RECEIVE, DUE_SOON, DUE_DAY, OVERDUE, IN_PROGRESS] }
 *         paymentMethodDescriptionEnum: { type: string, nullable: true }
 *         refMonthDueDate: { type: number }
 *         refYearDueDate: { type: number }
 *         refMonthPaymentDate: { type: number, nullable: true }
 *         refYearPaymentDate: { type: number, nullable: true }
 *         totalInterest: { type: number }
 *         paymentVariance: { type: number }
 *         effectiveRate: { type: number }
 *         paidInstallmentsCount: { type: number }
 *         firstInstallment: { type: boolean }
 *         categoryDescriptionEnum: { type: string, nullable: true }
 *         categoryGroup: { type: string, nullable: true }
 *         isFixedCost: { type: boolean }
 *         period: { type: string, nullable: true, enum: [WEEK, MONTH, YEAR] }
 *         frequency: { type: number, nullable: true }
 *         rootIsFixedCost: { type: boolean }
 *         rootHasInstallments: { type: boolean }
 *         hasChildren: { type: boolean }
 *         origin: { type: string, enum: [MANUAL, CARD_PURCHASE, CARD_INVOICE, SHOPPING_LIST, RECURRENCE, IMPORT] }
 *         reversed: { type: boolean }
 *         deleted: { type: boolean }
 *         createdAt: { type: string }
 *   responses:
 *     TransactionNotFound:
 *       description: Transação não encontrada.
 *       content:
 *         application/json:
 *           schema:
 *             allOf: [{ $ref: '#/components/schemas/ErrorResponse' }, { properties: { code: { enum: [TRANSACTION_NOT_FOUND] } } }]
 */
export {};
