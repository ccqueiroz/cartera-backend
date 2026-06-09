import {
  makeTransactionEngine,
  TransactionEngine,
} from '@/features/core-finance/transaction-engine/transaction-engine.factory';
import { InMemoryTransactionTreeRepository } from '@/features/core-finance/transaction-engine/infra/persistence/in-memory-transaction-tree.repository';
import { Transaction } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { CategoryGateway } from '@/features/core-finance/transaction-engine/domain/ports/category.gateway.port';
import { PaymentMethodGateway } from '@/features/core-finance/transaction-engine/domain/ports/payment-method.gateway.port';
import { TransactionTypeEnum } from '@/shared/kernel/enums/transaction-type.enum';
import { PaymentStatusEnum } from '@/shared/kernel/enums/payment-status.enum';
import { TransactionNotFoundError } from '@/features/core-finance/transaction-engine/domain/errors/transaction-not-found.error';
import { BusinessRuleViolationError } from '@/shared/kernel/errors/domain.error';

const categoryGateway: CategoryGateway = {
  resolve: async (descriptionEnum: string) =>
    descriptionEnum === 'RENT' ? { descriptionEnum, group: 'HOUSING' } : null,
};

const paymentMethodGateway: PaymentMethodGateway = {
  isActive: async (descriptionEnum: string) => descriptionEnum === 'PIX',
};

function makeEngine(): TransactionEngine {
  let counter = 0;
  return makeTransactionEngine({
    db: {} as any,
    repository: new InMemoryTransactionTreeRepository(),
    categoryGateway,
    paymentMethodGateway,
    generateId: () => `id-${++counter}`,
    now: () => '2026-01-01T00:00:00.000Z',
  });
}

describe('transaction-engine e2e (via factory + repo em memória)', () => {
  describe('UC-01 criar único', () => {
    it('nasce pago com paymentDate+paidAmount+paymentMethod', async () => {
      const engine = makeEngine();
      const node = await engine.createSingle.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 100,
        dueDate: '2026-03-10',
        paymentDate: '2026-03-09',
        paidAmount: 100,
        paymentMethodDescriptionEnum: 'PIX',
      });
      expect(node.paid).toBe(true);
      expect(node.toOutput().refMonthPaymentDate).toBe(3);
    });

    it('nasce não-pago sem os campos de pagamento', async () => {
      const engine = makeEngine();
      const node = await engine.createSingle.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 100,
        dueDate: '2026-03-10',
      });
      expect(node.paid).toBe(false);
    });

    it('forma de pagamento inativa é rejeitada', async () => {
      const engine = makeEngine();
      await expect(
        engine.createSingle.execute({
          type: TransactionTypeEnum.BILLS,
          amount: 100,
          dueDate: '2026-03-10',
          paymentDate: '2026-03-09',
          paidAmount: 100,
          paymentMethodDescriptionEnum: 'BOLETO',
        }),
      ).rejects.toThrow();
    });
  });

  describe('UC-02 criar parcelada', () => {
    it('mãe IN_PROGRESS, entrada paga, paidInstallmentsCount=1, totalInterest correto', async () => {
      const engine = makeEngine();
      const { mother } = await engine.createInstallmentPlan.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 1000,
        dueDate: '2026-03-10',
        entry: {
          amount: 100,
          paymentDate: '2026-03-10',
          paymentMethodDescriptionEnum: 'PIX',
        },
        installments: [
          { amount: 400, dueDate: '2026-04-10' },
          { amount: 400, dueDate: '2026-05-10' },
          { amount: 400, dueDate: '2026-06-10' },
        ],
      });
      const view = mother.toOutput();
      expect(view.paymentStatus).toBe(PaymentStatusEnum.IN_PROGRESS);
      expect(view.paidInstallmentsCount).toBe(1);
      expect(view.totalInterest).toBe(300);
      expect(view.currentAmount).toBe(1300);
    });

    it('desconto contratado (Σ filhas < mãe) → totalInterest negativo (D29)', async () => {
      const engine = makeEngine();
      const { mother } = await engine.createInstallmentPlan.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 1000,
        dueDate: '2026-03-10',
        entry: {
          amount: 500,
          paymentDate: '2026-03-10',
          paymentMethodDescriptionEnum: 'PIX',
        },
        installments: [
          { amount: 200, dueDate: '2026-04-10' },
          { amount: 200, dueDate: '2026-05-10' },
        ],
      });
      expect(mother.toOutput().totalInterest).toBe(-100);
    });

    it('parcelas < 1 e entrada >= total são erros', async () => {
      const engine = makeEngine();
      await expect(
        engine.createInstallmentPlan.execute({
          type: TransactionTypeEnum.BILLS,
          amount: 1000,
          dueDate: '2026-03-10',
          installments: [],
        }),
      ).rejects.toThrow();

      await expect(
        engine.createInstallmentPlan.execute({
          type: TransactionTypeEnum.BILLS,
          amount: 1000,
          dueDate: '2026-03-10',
          entry: {
            amount: 1000,
            paymentDate: '2026-03-10',
            paymentMethodDescriptionEnum: 'PIX',
          },
          installments: [{ amount: 400, dueDate: '2026-04-10' }],
        }),
      ).rejects.toThrow();
    });
  });

  describe('UC-03 listar', () => {
    it('filtro de pagamento vê só folhas reais — mãe nunca entra (D6)', async () => {
      const engine = makeEngine();
      const { mother } = await engine.createInstallmentPlan.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 900,
        dueDate: '2026-03-10',
        installments: [
          { amount: 300, dueDate: '2026-04-10' },
          { amount: 300, dueDate: '2026-05-10' },
          { amount: 300, dueDate: '2026-06-10' },
        ],
      });

      const aPagar = await engine.list.execute({
        scope: 'to_pay',
        rootId: mother.id,
      });
      expect(aPagar.every((node) => node.hasChildren === false)).toBe(true);
      expect(aPagar.some((node) => node.id === mother.id)).toBe(false);
      expect(aPagar).toHaveLength(3);
    });

    it('filtra por mês/ano usando o par de vencimento', async () => {
      const engine = makeEngine();
      const { mother } = await engine.createInstallmentPlan.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 600,
        dueDate: '2026-03-10',
        installments: [
          { amount: 300, dueDate: '2026-04-10' },
          { amount: 300, dueDate: '2026-05-10' },
        ],
      });
      const abril = await engine.list.execute({
        scope: 'to_pay',
        rootId: mother.id,
        month: 4,
        year: 2026,
      });
      expect(abril).toHaveLength(1);
      expect(abril[0].refMonthDueDate).toBe(4);
    });

    it('listagem de auditoria devolve só deletados e a padrão os exclui', async () => {
      const engine = makeEngine();
      const node = await engine.createSingle.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 100,
        dueDate: '2026-03-10',
      });
      await engine.softDelete.execute(node.id);

      const padrao = await engine.list.execute({ scope: 'to_pay' });
      expect(padrao).toHaveLength(0);
      const auditoria = await engine.listDeleted.execute();
      expect(auditoria).toHaveLength(1);
      expect(auditoria[0].deleted).toBe(true);
    });
  });

  describe('UC-04 ver por id', () => {
    it('devolve nó + filhas imediatas', async () => {
      const engine = makeEngine();
      const { mother } = await engine.createInstallmentPlan.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 600,
        dueDate: '2026-03-10',
        installments: [
          { amount: 300, dueDate: '2026-04-10' },
          { amount: 300, dueDate: '2026-05-10' },
        ],
      });
      const detail = await engine.getById.execute(mother.id);
      expect(detail.node.id).toBe(mother.id);
      expect(detail.children).toHaveLength(2);
    });

    it('nó deletado responde como inexistente (404)', async () => {
      const engine = makeEngine();
      const node = await engine.createSingle.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 100,
        dueDate: '2026-03-10',
      });
      await engine.softDelete.execute(node.id);
      await expect(engine.getById.execute(node.id)).rejects.toBeInstanceOf(
        TransactionNotFoundError,
      );
    });
  });

  describe('UC-05 editar', () => {
    it('propagação de dueDate pula filhas pagas e mantém cadência mensal', async () => {
      const engine = makeEngine();
      const { mother, children } = await engine.createInstallmentPlan.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 1000,
        dueDate: '2026-03-10',
        entry: {
          amount: 100,
          paymentDate: '2026-03-10',
          paymentMethodDescriptionEnum: 'PIX',
        },
        installments: [
          { amount: 400, dueDate: '2026-04-10' },
          { amount: 400, dueDate: '2026-05-10' },
        ],
      });
      const entry = children.find((c) => c.firstInstallment) as { id: string };

      await engine.edit.execute({
        id: mother.id,
        dueDate: '2026-06-10',
        propagate: true,
      });

      const detail = await engine.getById.execute(mother.id);
      const dueDates = detail.children
        .filter((c) => !c.firstInstallment)
        .map((c) => c.dueDate)
        .sort();
      expect(dueDates).toEqual(['2026-07-10', '2026-08-10']);

      const entryView = detail.children.find((c) => c.id === entry.id);
      expect(entryView?.dueDate).toBe('2026-03-10');
    });

    it('editar amount da mãe recalcula totalInterest', async () => {
      const engine = makeEngine();
      const { mother } = await engine.createInstallmentPlan.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 1000,
        dueDate: '2026-03-10',
        installments: [
          { amount: 550, dueDate: '2026-04-10' },
          { amount: 550, dueDate: '2026-05-10' },
        ],
      });
      expect(mother.toOutput().totalInterest).toBe(100);

      const root = await engine.edit.execute({ id: mother.id, amount: 900 });
      expect(root.toOutput().totalInterest).toBe(200);
    });

    it('edição direta de nó pago é permitida (correção de cadastro)', async () => {
      const engine = makeEngine();
      const { children } = await engine.createInstallmentPlan.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 600,
        dueDate: '2026-03-10',
        installments: [{ amount: 600, dueDate: '2026-04-10' }],
      });
      const leafId = children[0].id;
      await engine.settle.execute({
        id: leafId,
        paymentDate: '2026-04-10',
        paidAmount: 600,
        paymentMethodDescriptionEnum: 'PIX',
      });

      await engine.edit.execute({ id: leafId, dueDate: '2026-09-10' });

      const detail = await engine.getById.execute(leafId);
      expect(detail.node.dueDate).toBe('2026-09-10');
      expect(detail.node.refMonthDueDate).toBe(9);
      expect(detail.node.paid).toBe(true);
    });
  });

  describe('UC-06 settle', () => {
    it('folha com variância: registra paymentVariance e recalcula a mãe', async () => {
      const engine = makeEngine();
      const { mother, children } = await engine.createInstallmentPlan.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 1000,
        dueDate: '2026-03-10',
        installments: [
          { amount: 550, dueDate: '2026-04-10' },
          { amount: 550, dueDate: '2026-05-10' },
        ],
      });
      const leafId = children[0].id;
      const root = await engine.settle.execute({
        id: leafId,
        paymentDate: '2026-04-10',
        paidAmount: 600,
        paymentMethodDescriptionEnum: 'PIX',
      });
      expect(root.id).toBe(mother.id);
      expect(root.toOutput().paymentVariance).toBe(50);
      expect(root.toOutput().totalInterest).toBe(100);
      expect(root.paidInstallmentsCount).toBe(1);
    });

    it('settle direto em nó interno é erro de domínio', async () => {
      const engine = makeEngine();
      const { mother } = await engine.createInstallmentPlan.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 600,
        dueDate: '2026-03-10',
        installments: [{ amount: 600, dueDate: '2026-04-10' }],
      });
      await expect(
        engine.settle.execute({
          id: mother.id,
          paymentDate: '2026-03-10',
          paidAmount: 600,
          paymentMethodDescriptionEnum: 'PIX',
        }),
      ).rejects.toBeInstanceOf(BusinessRuleViolationError);
    });
  });

  describe('quitação global', () => {
    it('parcial: rateio Hamilton conserva o total e reporta as selecionadas pagas', async () => {
      const engine = makeEngine();
      const { mother, children } = await engine.createInstallmentPlan.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 2200,
        dueDate: '2026-03-10',
        installments: Array.from({ length: 11 }, (_, i) => ({
          amount: 200,
          dueDate: `2026-${String(3 + i).padStart(2, '0')}-10`,
        })),
      });
      const selection = children.map((c) => c.id);

      const result = await engine.globalSettlement.execute({
        nodeId: mother.id,
        selection,
        valorPago: 1300,
        paymentDate: '2026-03-10',
        paymentMethodDescriptionEnum: 'PIX',
      });
      expect(result.settledLeafIds).toHaveLength(11);

      const detail = await engine.getById.execute(mother.id);
      const totalPago = Number(
        detail.children.reduce((sum, c) => sum + c.paidAmount, 0).toFixed(2),
      );
      expect(totalPago).toBe(1300);
      expect(detail.children.every((c) => c.paid)).toBe(true);
      expect(detail.node.paid).toBe(true);
    });

    it('folha paga fica intocada no rateio total', async () => {
      const engine = makeEngine();
      const { mother, children } = await engine.createInstallmentPlan.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 600,
        dueDate: '2026-03-10',
        entry: {
          amount: 100,
          paymentDate: '2026-03-10',
          paymentMethodDescriptionEnum: 'PIX',
        },
        installments: [
          { amount: 300, dueDate: '2026-04-10' },
          { amount: 200, dueDate: '2026-05-10' },
        ],
      });
      const entry = children.find((c) => c.firstInstallment) as { id: string };

      await engine.globalSettlement.execute({
        nodeId: mother.id,
        paymentDate: '2026-06-01',
        paymentMethodDescriptionEnum: 'PIX',
      });

      const detail = await engine.getById.execute(mother.id);
      const entryView = detail.children.find((c) => c.id === entry.id);
      expect(entryView?.paidAmount).toBe(100);
      expect(entryView?.paymentDate).toBe('2026-03-10');
    });
  });

  describe('UC-07 soft delete em cascata', () => {
    it('deleta a subárvore e recalcula os ancestrais', async () => {
      const engine = makeEngine();
      const { mother, children } = await engine.createInstallmentPlan.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 600,
        dueDate: '2026-03-10',
        installments: [
          { amount: 300, dueDate: '2026-04-10' },
          { amount: 300, dueDate: '2026-05-10' },
        ],
      });
      await engine.softDelete.execute(children[0].id);

      const detail = await engine.getById.execute(mother.id);
      expect(detail.children).toHaveLength(1);
      expect(detail.node.currentAmount).toBe(300);
    });
  });

  describe('UC-09 estorno', () => {
    it('estorna a folha e reabre a mãe (IN_PROGRESS)', async () => {
      const engine = makeEngine();
      const { children } = await engine.createInstallmentPlan.execute({
        type: TransactionTypeEnum.BILLS,
        amount: 600,
        dueDate: '2026-03-10',
        installments: [{ amount: 600, dueDate: '2026-04-10' }],
      });
      const leafId = children[0].id;
      await engine.settle.execute({
        id: leafId,
        paymentDate: '2026-04-10',
        paidAmount: 600,
        paymentMethodDescriptionEnum: 'PIX',
      });

      const root = await engine.reverse.execute(leafId);
      expect(root.paymentStatus).toBe(PaymentStatusEnum.IN_PROGRESS);
      expect(root.paid).toBe(false);

      await expect(engine.reverse.execute(leafId)).rejects.toBeInstanceOf(
        BusinessRuleViolationError,
      );
    });
  });

  describe('quitação global — árvore profundidade 3 (rateio recursivo T1.2.2)', () => {
    const createdAt = '2026-01-01T00:00:00.000Z';

    function node(
      id: string,
      parentId: string | null,
      amount: number,
      hasChildren: boolean,
    ): Transaction {
      return Transaction.create({
        id,
        parentId,
        rootId: 'R',
        type: TransactionTypeEnum.BILLS,
        amount: Money.create(amount),
        dueDate: '2026-03-10',
        createdAt,
        hasChildren,
      });
    }

    it('valorPago reportado desce por nó: folha B=200 (não 208.70), total conservado', async () => {
      const repository = new InMemoryTransactionTreeRepository();
      const engine = makeTransactionEngine({
        db: {} as any,
        repository,
        categoryGateway,
        paymentMethodGateway,
        now: () => createdAt,
      });
      // R → A (interno, amount 400) + B (folha 200); A → a1 (150) + a2 (225).
      await repository.saveMany([
        node('R', null, 600, true),
        node('A', 'R', 400, true),
        node('a1', 'A', 150, false),
        node('a2', 'A', 225, false),
        node('B', 'R', 200, false),
      ]);

      const result = await engine.globalSettlement.execute({
        nodeId: 'R',
        selection: ['A', 'B'],
        valorPago: 600,
        paymentDate: '2026-03-10',
        paymentMethodDescriptionEnum: 'PIX',
      });
      expect(result.settledLeafIds.sort()).toEqual(['B', 'a1', 'a2']);

      const underA = await engine.getById.execute('A');
      const a1 = underA.children.find((c) => c.id === 'a1');
      const a2 = underA.children.find((c) => c.id === 'a2');
      const rootDetail = await engine.getById.execute('R');
      const b = rootDetail.children.find((c) => c.id === 'B');

      expect(a1?.paidAmount).toBe(160);
      expect(a2?.paidAmount).toBe(240);
      expect(b?.paidAmount).toBe(200);
      expect(
        Number(
          (
            (a1?.paidAmount ?? 0) +
            (a2?.paidAmount ?? 0) +
            (b?.paidAmount ?? 0)
          ).toFixed(2),
        ),
      ).toBe(600);
    });

    it('seleção pai+filho não duplica rateio: descendente do interno é descartado, Σ=X', async () => {
      const repository = new InMemoryTransactionTreeRepository();
      const engine = makeTransactionEngine({
        db: {} as any,
        repository,
        categoryGateway,
        paymentMethodGateway,
        now: () => createdAt,
      });
      await repository.saveMany([
        node('R', null, 600, true),
        node('A', 'R', 400, true),
        node('a1', 'A', 150, false),
        node('a2', 'A', 225, false),
        node('B', 'R', 200, false),
      ]);

      // Seleção redundante: A (interno) + a1 (folha descendente de A). a1 some.
      const result = await engine.globalSettlement.execute({
        nodeId: 'R',
        selection: ['A', 'a1', 'B'],
        valorPago: 600,
        paymentDate: '2026-03-10',
        paymentMethodDescriptionEnum: 'PIX',
      });
      expect(result.settledLeafIds.sort()).toEqual(['B', 'a1', 'a2']);

      const underA = await engine.getById.execute('A');
      const rootDetail = await engine.getById.execute('R');
      const total =
        (underA.children.find((c) => c.id === 'a1')?.paidAmount ?? 0) +
        (underA.children.find((c) => c.id === 'a2')?.paidAmount ?? 0) +
        (rootDetail.children.find((c) => c.id === 'B')?.paidAmount ?? 0);
      expect(Number(total.toFixed(2))).toBe(600);
    });

    it('quitação em cheio (sem valorPago): cada folha pelo próprio amount, variância 0', async () => {
      const repository = new InMemoryTransactionTreeRepository();
      const engine = makeTransactionEngine({
        db: {} as any,
        repository,
        categoryGateway,
        paymentMethodGateway,
        now: () => createdAt,
      });
      await repository.saveMany([
        node('R', null, 600, true),
        node('A', 'R', 400, true),
        node('a1', 'A', 150, false),
        node('a2', 'A', 225, false),
        node('B', 'R', 200, false),
      ]);

      await engine.globalSettlement.execute({
        nodeId: 'R',
        paymentDate: '2026-03-10',
        paymentMethodDescriptionEnum: 'PIX',
      });

      const underA = await engine.getById.execute('A');
      expect(underA.children.find((c) => c.id === 'a1')?.paidAmount).toBe(150);
      expect(underA.children.find((c) => c.id === 'a2')?.paidAmount).toBe(225);
      expect(underA.children.every((c) => c.paymentVariance === 0)).toBe(true);
    });
  });
});
