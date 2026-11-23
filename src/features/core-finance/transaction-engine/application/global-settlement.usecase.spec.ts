import { makeTransactionEngine } from '@/features/core-finance/transaction-engine/transaction-engine.factory';
import { InMemoryTransactionTreeRepository } from '@/features/core-finance/transaction-engine/infra/persistence/in-memory-transaction-tree.repository';
import { LeafSettlement } from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';
import { Transaction } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { TransactionTypeEnum } from '@/shared/kernel/enums/transaction-type.enum';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { AtomicContext } from '@/shared/database/atomic-runner';

const userId = 'user-1';
const changedAt = '2026-06-02T00:00:00.000Z';
const ctx = { txn: {} } as AtomicContext;

type LeafChange = (
  tree: InMemoryTransactionTreeRepository,
  leafId: string,
) => Promise<unknown>;

// A concurrent request changes the leaf after the use case read the tree and before the repository rereads it; a subclass, because be-tests forbids jest.fn on a repository method.
class ChangedBeforeSettleRepository extends InMemoryTransactionTreeRepository {
  public changeBeforeSettle: () => Promise<unknown> = async () => undefined;

  public async settleLeavesAndRollupTx(
    atomicContext: AtomicContext,
    settlements: LeafSettlement[],
    today?: Date,
  ): Promise<Transaction[]> {
    await this.changeBeforeSettle();
    return super.settleLeavesAndRollupTx(atomicContext, settlements, today);
  }
}

async function settleWithChange(change: LeafChange, valorPago?: number) {
  const repository = new ChangedBeforeSettleRepository();
  let counter = 0;
  const engine = makeTransactionEngine({
    db: {} as never,
    repository,
    categoryGateway: { resolve: async () => null },
    paymentMethodGateway: { isActive: async () => true },
    generateId: () => `tx-${++counter}`,
    now: () => '2026-06-01T00:00:00.000Z',
  });
  const { mother, children } = await engine.createInstallmentPlan.execute({
    userId,
    personId: 'person-1',
    type: TransactionTypeEnum.BILLS,
    amount: 200,
    dueDate: '2026-06-10',
    installments: [
      { amount: 100, dueDate: '2026-06-10' },
      { amount: 100, dueDate: '2026-07-10' },
    ],
  });
  const [first, last] = children;
  repository.changeBeforeSettle = () => change(repository, last.id);
  const result = await engine.globalSettlement.executeTx(ctx, {
    nodeId: mother.id,
    userId,
    paymentDate: '2026-06-05',
    paymentMethodDescriptionEnum: 'PIX',
    valorPago,
  });
  return { result, firstId: first.id, lastId: last.id };
}

const deleteLeaf: LeafChange = (tree, leafId) =>
  tree.softDeleteSubtreeAndRollup(leafId, changedAt);

const editLeafTo150: LeafChange = (tree, leafId) =>
  tree.mutateAndRollup(leafId, (leaf) =>
    leaf.edit({ amount: Money.create(150), updatedAt: changedAt }),
  );

describe('GlobalSettlementUseCase', () => {
  it('[CDC-15] leaves a leaf deleted before the settle out of the settled amounts', async () => {
    const { result, firstId } = await settleWithChange(deleteLeaf);
    expect(result).toEqual({
      settledLeafIds: [firstId],
      settledAmounts: [{ leafId: firstId, paidAmount: 100 }],
    });
  });

  it('[CDC-15] settles in full a leaf edited before the settle by its reread amount', async () => {
    const { result, firstId, lastId } = await settleWithChange(editLeafTo150);
    expect(result.settledAmounts).toEqual([
      { leafId: firstId, paidAmount: 100 },
      { leafId: lastId, paidAmount: 150 },
    ]);
  });

  it('[CDC-15] leaves a leaf deleted before a partial settle out and keeps the share of the leaf that settled', async () => {
    const { result, firstId } = await settleWithChange(deleteLeaf, 150);
    expect(result).toEqual({
      settledLeafIds: [firstId],
      settledAmounts: [{ leafId: firstId, paidAmount: 75 }],
    });
  });
});
