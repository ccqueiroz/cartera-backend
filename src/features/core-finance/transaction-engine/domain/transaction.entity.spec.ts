import { Transaction } from './transaction.entity';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { PaymentStatusEnum } from '@/shared/kernel/enums/payment-status.enum';
import { TransactionTypeEnum } from '@/shared/kernel/enums/transaction-type.enum';
import { TransactionOriginEnum } from '@/shared/kernel/enums/transaction-origin.enum';
import { PeriodEnum } from '@/shared/kernel/enums/period.enum';
import {
  BusinessRuleViolationError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const createdAt = '2026-01-01T00:00:00.000Z';
const userId = 'user-1';
const personId = 'person-1';

function captureError(run: () => unknown): unknown {
  try {
    run();
    return null;
  } catch (error) {
    return error;
  }
}

function leaf(id: string, parentId: string, amount: number, dueDate: string) {
  return Transaction.create({
    id,
    parentId,
    rootId: parentId,
    userId,
    personId,
    type: TransactionTypeEnum.BILLS,
    amount: Money.create(amount),
    dueDate,
    createdAt,
  });
}

function mother(id: string, amount: number) {
  return Transaction.create({
    id,
    parentId: null,
    rootId: id,
    userId,
    personId,
    type: TransactionTypeEnum.BILLS,
    amount: Money.create(amount),
    dueDate: '2026-03-10',
    createdAt,
    hasChildren: true,
  });
}

describe('Transaction entity', () => {
  describe('temporal derivation and refs', () => {
    it('derives refMonth/refYear from dueDate; payment stays null until paid', () => {
      const node = leaf('l1', 'm', 100, '2026-09-10');
      const view = node.toOutput();
      expect(view.refMonthDueDate).toBe(9);
      expect(view.refYearDueDate).toBe(2026);
      expect(view.refMonthPaymentDate).toBeNull();
      expect(view.refYearPaymentDate).toBeNull();
    });

    it('early payment records the payment month, not the due month', () => {
      const node = leaf('l1', 'm', 100, '2026-09-10');
      node.settle({
        paymentDate: '2026-04-05',
        paidAmount: Money.create(100),
        paymentMethodDescriptionEnum: 'PIX',
        updatedAt: createdAt,
      });
      const view = node.toOutput();
      expect(view.refMonthPaymentDate).toBe(4);
      expect(view.refYearPaymentDate).toBe(2026);
    });
  });

  describe('rollup, pago-derivado e paidInstallmentsCount', () => {
    it('parent condenses its children: currentAmount, totalInterest, paidInstallmentsCount', () => {
      const m = mother('m', 1000);
      const c1 = leaf('c1', 'm', 550, '2026-03-10');
      const c2 = leaf('c2', 'm', 550, '2026-04-10');
      m.recomputeFromChildren([c1, c2]);

      const view = m.toOutput();
      expect(view.currentAmount).toBe(1100);
      expect(view.totalInterest).toBe(100);
      expect(view.paidInstallmentsCount).toBe(0);
      expect(m.paid).toBe(false);
      expect(view.paymentStatus).toBe(PaymentStatusEnum.IN_PROGRESS);
    });

    it('parent becomes paid-derived when all children are paid; the account cascades', () => {
      const m = mother('m', 1000);
      const c1 = leaf('c1', 'm', 500, '2026-03-10');
      const c2 = leaf('c2', 'm', 500, '2026-04-10');

      c1.settle({
        paymentDate: '2026-03-10',
        paidAmount: Money.create(500),
        paymentMethodDescriptionEnum: 'PIX',
        updatedAt: createdAt,
      });
      m.recomputeFromChildren([c1, c2]);
      expect(m.paidInstallmentsCount).toBe(1);
      expect(m.paid).toBe(false);
      expect(m.paymentStatus).toBe(PaymentStatusEnum.IN_PROGRESS);

      c2.settle({
        paymentDate: '2026-04-10',
        paidAmount: Money.create(500),
        paymentMethodDescriptionEnum: 'PIX',
        updatedAt: createdAt,
      });
      m.recomputeFromChildren([c1, c2]);
      expect(m.paidInstallmentsCount).toBe(2);
      expect(m.paid).toBe(true);
      expect(m.paymentStatus).toBe(PaymentStatusEnum.PAID);
    });
  });

  describe('totalInterest x paymentVariance (D18)', () => {
    it('payoff variance flows only to paymentVariance, never to totalInterest', () => {
      const m = mother('m', 1000);
      const c1 = leaf('c1', 'm', 550, '2026-03-10');
      const c2 = leaf('c2', 'm', 550, '2026-04-10');

      c1.settle({
        paymentDate: '2026-03-10',
        paidAmount: Money.create(600),
        paymentMethodDescriptionEnum: 'PIX',
        updatedAt: createdAt,
      });
      m.recomputeFromChildren([c1, c2]);

      const view = m.toOutput();
      expect(view.totalInterest).toBe(100);
      expect(view.paymentVariance).toBe(50);
      expect(c1.toOutput().paymentVariance).toBe(50);
    });

    it('desconto contratado: totalInterest negativo, nunca clampado em 0 (D29)', () => {
      const m = mother('m', 1000);
      const c1 = leaf('c1', 'm', 400, '2026-03-10');
      const c2 = leaf('c2', 'm', 400, '2026-04-10');
      m.recomputeFromChildren([c1, c2]);
      expect(m.toOutput().totalInterest).toBe(-200);
    });

    it('recursive rollup sums totalInterest with the sign of the internal children', () => {
      const grandchild1 = leaf('g1', 'sub', 100, '2026-03-10');
      const grandchild2 = leaf('g2', 'sub', 100, '2026-04-10');
      const sub = Transaction.create({
        id: 'sub',
        parentId: 'm',
        rootId: 'm',
        userId,
        personId,
        type: TransactionTypeEnum.BILLS,
        amount: Money.create(250),
        dueDate: '2026-03-10',
        createdAt,
        hasChildren: true,
      });
      sub.recomputeFromChildren([grandchild1, grandchild2]);
      expect(sub.toOutput().totalInterest).toBe(-50);

      const m = mother('m', 300);
      const sibling = leaf('s', 'm', 250, '2026-05-10');
      m.recomputeFromChildren([sub, sibling]);
      // (250 + 250) − 300 + (−50) = 150
      expect(m.toOutput().totalInterest).toBe(150);
    });

    it('discount generates negative variance', () => {
      const node = leaf('l', 'm', 150, '2026-03-10');
      node.settle({
        paymentDate: '2026-03-10',
        paidAmount: Money.create(118),
        paymentMethodDescriptionEnum: 'PIX',
        updatedAt: createdAt,
      });
      expect(node.toOutput().paymentVariance).toBe(-32);
    });
  });

  describe('effectiveRate (derived, not persisted)', () => {
    it('leaf with discount derives a negative rate', () => {
      const node = leaf('l', 'm', 150, '2026-03-10');
      node.settle({
        paymentDate: '2026-03-10',
        paidAmount: Money.create(118),
        paymentMethodDescriptionEnum: 'PIX',
        updatedAt: createdAt,
      });
      expect(node.toOutput().effectiveRate).toBe(-0.2133);
      expect(node.toPersistence()).not.toHaveProperty('effectiveRate');
    });

    it('parent: total effective rate over the original price', () => {
      const m = mother('m', 1000);
      const c1 = leaf('c1', 'm', 550, '2026-03-10');
      const c2 = leaf('c2', 'm', 550, '2026-04-10');
      c1.settle({
        paymentDate: '2026-03-10',
        paidAmount: Money.create(550),
        paymentMethodDescriptionEnum: 'PIX',
        updatedAt: createdAt,
      });
      c2.settle({
        paymentDate: '2026-04-10',
        paidAmount: Money.create(550),
        paymentMethodDescriptionEnum: 'PIX',
        updatedAt: createdAt,
      });
      m.recomputeFromChildren([c1, c2]);
      expect(m.toOutput().effectiveRate).toBe(0.1);
    });

    it('guard amount = 0 does not break', () => {
      const node = leaf('l', 'm', 0, '2026-03-10');
      expect(node.toOutput().effectiveRate).toBe(0);
    });
  });

  describe('domain guards', () => {
    it('settle on an internal node is an error', () => {
      const m = mother('m', 100);
      m.recomputeFromChildren([leaf('c', 'm', 100, '2026-03-10')]);
      expect(() =>
        m.settle({
          paymentDate: '2026-03-10',
          paidAmount: Money.create(100),
          paymentMethodDescriptionEnum: 'PIX',
          updatedAt: createdAt,
        }),
      ).toThrow(BusinessRuleViolationError);
    });

    it('double settle is an error', () => {
      const node = leaf('l', 'm', 100, '2026-03-10');
      const settle = () =>
        node.settle({
          paymentDate: '2026-03-10',
          paidAmount: Money.create(100),
          paymentMethodDescriptionEnum: 'PIX',
          updatedAt: createdAt,
        });
      settle();
      expect(settle).toThrow(BusinessRuleViolationError);
    });

    it('reversing unpaid, down payment, double or internal nodes gives errors', () => {
      const open = leaf('l', 'm', 100, '2026-03-10');
      expect(() => open.reverse(createdAt)).toThrow(BusinessRuleViolationError);

      const entry = Transaction.create({
        id: 'e',
        parentId: 'm',
        rootId: 'm',
        userId,
        personId,
        type: TransactionTypeEnum.BILLS,
        amount: Money.create(100),
        dueDate: '2026-03-10',
        createdAt,
        firstInstallment: true,
        paymentDate: '2026-03-10',
        paidAmount: Money.create(100),
        paymentMethodDescriptionEnum: 'PIX',
      });
      expect(() => entry.reverse(createdAt)).toThrow(
        BusinessRuleViolationError,
      );

      const paid = leaf('p', 'm', 100, '2026-03-10');
      paid.settle({
        paymentDate: '2026-03-10',
        paidAmount: Money.create(100),
        paymentMethodDescriptionEnum: 'PIX',
        updatedAt: createdAt,
      });
      paid.reverse(createdAt);
      expect(paid.reversed).toBe(true);
      expect(() => paid.reverse(createdAt)).toThrow(BusinessRuleViolationError);
    });

    it('reinstallment: paid leaf is immutable (does not become internal)', () => {
      const paid = leaf('p', 'm', 100, '2026-03-10');
      paid.settle({
        paymentDate: '2026-03-10',
        paidAmount: Money.create(100),
        paymentMethodDescriptionEnum: 'PIX',
        updatedAt: createdAt,
      });
      expect(() => paid.markAsInternal()).toThrow(BusinessRuleViolationError);

      const open = leaf('o', 'm', 100, '2026-03-10');
      open.markAsInternal();
      expect(open.hasChildren).toBe(true);
    });
  });

  describe('reversal reopens the parent', () => {
    it('reversing the only paid leaf sets the parent back to IN_PROGRESS', () => {
      const m = mother('m', 100);
      const c = leaf('c', 'm', 100, '2026-03-10');
      c.settle({
        paymentDate: '2026-03-10',
        paidAmount: Money.create(100),
        paymentMethodDescriptionEnum: 'PIX',
        updatedAt: createdAt,
      });
      m.recomputeFromChildren([c]);
      expect(m.paid).toBe(true);

      c.reverse(createdAt);
      m.recomputeFromChildren([c]);
      expect(m.paid).toBe(false);
      expect(m.paymentStatus).toBe(PaymentStatusEnum.IN_PROGRESS);
      expect(m.paidInstallmentsCount).toBe(0);
    });
  });

  describe('new attributes (R1): serialization and propagation', () => {
    function fixedCost(id: string) {
      return Transaction.create({
        id,
        parentId: null,
        rootId: id,
        userId,
        personId,
        type: TransactionTypeEnum.BILLS,
        amount: Money.create(100),
        dueDate: '2026-03-10',
        createdAt,
        isFixedCost: true,
        period: PeriodEnum.MONTH,
        frequency: -1,
      });
    }

    it('toPersistence/with/toOutput carregam os 7 atributos (round-trip)', () => {
      const node = fixedCost('fc');
      const persistence = node.toPersistence();
      expect(persistence.userId).toBe(userId);
      expect(persistence.personId).toBe(personId);
      expect(persistence.isFixedCost).toBe(true);
      expect(persistence.period).toBe(PeriodEnum.MONTH);
      expect(persistence.frequency).toBe(-1);
      expect(persistence.rootIsFixedCost).toBe(true);
      expect(persistence.rootHasInstallments).toBe(false);

      const out = Transaction.with(persistence).toOutput();
      expect(out.userId).toBe(userId);
      expect(out.personId).toBe(personId);
      expect(out.isFixedCost).toBe(true);
      expect(out.period).toBe(PeriodEnum.MONTH);
      expect(out.frequency).toBe(-1);
      expect(out.rootIsFixedCost).toBe(true);
      expect(out.rootHasInstallments).toBe(false);
    });

    it('simple non-fixed-cost node starts with period/frequency null and rootIsFixedCost false', () => {
      const node = leaf('l1', 'l1', 100, '2026-09-10');
      const out = node.toOutput();
      expect(out.isFixedCost).toBe(false);
      expect(out.period).toBeNull();
      expect(out.frequency).toBeNull();
      expect(out.rootIsFixedCost).toBe(false);
    });
  });

  describe('ownership (R2): userId/personId required and userId immutable', () => {
    it('creating without userId or personId is a domain error', () => {
      const base = {
        id: 'x',
        parentId: null,
        rootId: 'x',
        type: TransactionTypeEnum.BILLS,
        amount: Money.create(100),
        dueDate: '2026-03-10',
        createdAt,
      };
      expect(() =>
        Transaction.create({ ...base, userId: '', personId }),
      ).toThrow(ValidationError);
      expect(() =>
        Transaction.create({ ...base, userId, personId: '' }),
      ).toThrow(ValidationError);
    });

    it('userId is only a getter: edit never changes it', () => {
      const node = leaf('l1', 'm', 100, '2026-03-10');
      node.edit({ dueDate: '2026-05-10', updatedAt: createdAt });
      expect(node.userId).toBe(userId);
    });
  });

  describe('invariante de custo-fixo (R3)', () => {
    function build(overrides: {
      isFixedCost?: boolean;
      period?: PeriodEnum | null;
      frequency?: number | null;
    }) {
      return () =>
        Transaction.create({
          id: 'fc',
          parentId: null,
          rootId: 'fc',
          userId,
          personId,
          type: TransactionTypeEnum.BILLS,
          amount: Money.create(100),
          dueDate: '2026-03-10',
          createdAt,
          ...overrides,
        });
    }

    it('isFixedCost=false with period or frequency filled is rejected', () => {
      expect(build({ isFixedCost: false, period: PeriodEnum.MONTH })).toThrow(
        BusinessRuleViolationError,
      );
      expect(build({ isFixedCost: false, frequency: 3 })).toThrow(
        BusinessRuleViolationError,
      );
    });

    it('isFixedCost=true requires a valid period and frequency -1 or an integer >= 2', () => {
      expect(
        build({ isFixedCost: true, period: PeriodEnum.WEEK, frequency: -1 }),
      ).not.toThrow();
      expect(
        build({ isFixedCost: true, period: PeriodEnum.YEAR, frequency: 2 }),
      ).not.toThrow();
    });

    it('frequency 0, 1, fractional and negative other than -1 are rejected', () => {
      for (const frequency of [0, 1, 1.5, -2]) {
        expect(
          build({ isFixedCost: true, period: PeriodEnum.MONTH, frequency }),
        ).toThrow(BusinessRuleViolationError);
      }
    });

    it('the error uses the dedicated fixed-cost ErrorCode', () => {
      const run = build({
        isFixedCost: true,
        period: PeriodEnum.MONTH,
        frequency: 1,
      });
      const error = captureError(run);
      expect(error).toBeInstanceOf(BusinessRuleViolationError);
      expect((error as BusinessRuleViolationError).code).toBe(
        ErrorCode.TRANSACTION_INVALID_FIXED_COST,
      );
    });
  });

  describe('root denormalization (R11)', () => {
    it('parent created with hasChildren starts with rootHasInstallments true', () => {
      expect(mother('m', 1000).toOutput().rootHasInstallments).toBe(true);
    });

    it('root without children has rootHasInstallments false; the recompute piggyback turns it on', () => {
      const root = Transaction.create({
        id: 'root',
        parentId: null,
        rootId: 'root',
        userId,
        personId,
        type: TransactionTypeEnum.BILLS,
        amount: Money.create(1000),
        dueDate: '2026-03-10',
        createdAt,
      });
      expect(root.toOutput().rootHasInstallments).toBe(false);
      root.recomputeFromChildren([leaf('c1', 'root', 1000, '2026-04-10')]);
      expect(root.toOutput().rootHasInstallments).toBe(true);
    });
  });

  describe('origin', () => {
    function single(origin?: TransactionOriginEnum) {
      return Transaction.create({
        id: 'n1',
        parentId: null,
        rootId: 'n1',
        userId,
        personId,
        type: TransactionTypeEnum.BILLS,
        amount: Money.create(100),
        dueDate: '2026-03-10',
        createdAt,
        origin,
      });
    }

    it('defaults to MANUAL when absent', () => {
      expect(single().origin).toBe(TransactionOriginEnum.MANUAL);
    });

    it('keeps the explicit origin and exposes it in toPersistence/toOutput', () => {
      const node = single(TransactionOriginEnum.IMPORT);
      expect(node.origin).toBe(TransactionOriginEnum.IMPORT);
      expect(node.toPersistence().origin).toBe(TransactionOriginEnum.IMPORT);
      expect(node.toOutput().origin).toBe(TransactionOriginEnum.IMPORT);
    });

    it('persisted document without the field hydrates as MANUAL', () => {
      const persistence = single(
        TransactionOriginEnum.CARD_PURCHASE,
      ).toPersistence();
      delete (persistence as { origin?: unknown }).origin;
      expect(Transaction.with(persistence).origin).toBe(
        TransactionOriginEnum.MANUAL,
      );
    });
  });
});
