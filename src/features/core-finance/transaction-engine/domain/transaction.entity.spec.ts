import { Transaction } from './transaction.entity';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { PaymentStatusEnum } from '@/shared/kernel/enums/payment-status.enum';
import { TransactionTypeEnum } from '@/shared/kernel/enums/transaction-type.enum';
import { BusinessRuleViolationError } from '@/shared/kernel/errors/domain.error';

const createdAt = '2026-01-01T00:00:00.000Z';

function leaf(id: string, parentId: string, amount: number, dueDate: string) {
  return Transaction.create({
    id,
    parentId,
    rootId: parentId,
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
    type: TransactionTypeEnum.BILLS,
    amount: Money.create(amount),
    dueDate: '2026-03-10',
    createdAt,
    hasChildren: true,
  });
}

describe('Transaction entity', () => {
  describe('derivação temporal e refs', () => {
    it('deriva refMonth/refYear de dueDate; payment fica null até pago', () => {
      const node = leaf('l1', 'm', 100, '2026-09-10');
      const view = node.toOutput();
      expect(view.refMonthDueDate).toBe(9);
      expect(view.refYearDueDate).toBe(2026);
      expect(view.refMonthPaymentDate).toBeNull();
      expect(view.refYearPaymentDate).toBeNull();
    });

    it('pagamento antecipado registra o mês do pagamento, não do vencimento', () => {
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
    it('mãe condensa as filhas: currentAmount, totalInterest, paidInstallmentsCount', () => {
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

    it('mãe vira pago-derivada quando todas as filhas pagam; conta cascateia', () => {
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

  describe('totalInterest × paymentVariance (D18)', () => {
    it('variação de quitação flui só para paymentVariance, nunca para totalInterest', () => {
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

    it('rollup recursivo soma totalInterest com sinal das filhas internas', () => {
      const grandchild1 = leaf('g1', 'sub', 100, '2026-03-10');
      const grandchild2 = leaf('g2', 'sub', 100, '2026-04-10');
      const sub = Transaction.create({
        id: 'sub',
        parentId: 'm',
        rootId: 'm',
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

    it('desconto gera variância negativa', () => {
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

  describe('effectiveRate (derivado, não persistido)', () => {
    it('folha com desconto deriva taxa negativa', () => {
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

    it('mãe: taxa efetiva total sobre o preço original', () => {
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

    it('guard amount = 0 não quebra', () => {
      const node = leaf('l', 'm', 0, '2026-03-10');
      expect(node.toOutput().effectiveRate).toBe(0);
    });
  });

  describe('guardas de domínio', () => {
    it('settle em nó interno é erro', () => {
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

    it('settle duplo é erro', () => {
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

    it('estornar não-pago, entrada, duplo e interno são erros', () => {
      const open = leaf('l', 'm', 100, '2026-03-10');
      expect(() => open.reverse(createdAt)).toThrow(BusinessRuleViolationError);

      const entry = Transaction.create({
        id: 'e',
        parentId: 'm',
        rootId: 'm',
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

    it('reparcel: folha paga é imutável (não vira interna)', () => {
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

  describe('estorno reabre a mãe', () => {
    it('estornar a única folha paga devolve a mãe a IN_PROGRESS', () => {
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
});
