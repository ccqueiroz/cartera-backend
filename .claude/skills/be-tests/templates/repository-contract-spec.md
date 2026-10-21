# Repository contract spec

`infra/persistence/<feature>.repository.contract.spec.ts`. One `describe.each` over both adapters; the Firestore adapter runs over a Firestore fake that encodes the Firestore rules: `== null` only matches a present null, reads before writes in a transaction, writes applied on commit, `undefined` rejected. A shared fake is planned; until it exists, keep the fake local to the spec, as the sibling specs do.

```ts
import { Budget } from '@/features/budget/domain/budget.entity';
import { BudgetRepository } from '@/features/budget/domain/ports/budget.repository.port';
import { InMemoryBudgetRepository } from '@/features/budget/infra/persistence/in-memory-budget.repository';
import { BudgetRepositoryFirestore } from '@/features/budget/infra/persistence/budget.repository.firestore';

// Local Firestore fake with the rules above; replace it by the shared fake when that exists.
declare function makeFirestoreFake(): { db: any };

const build = (id: string, userId = 'user-1') =>
  Budget.create({
    id,
    userId,
    name: `Budget ${id}`,
    limit: 100,
    createdAt: '2026-10-01T00:00:00.000Z',
  });

const adapters: [string, () => BudgetRepository][] = [
  ['in-memory', () => new InMemoryBudgetRepository()],
  [
    'firestore (fake)',
    () => BudgetRepositoryFirestore.create(makeFirestoreFake().db),
  ],
];

describe.each(adapters)(
  'BudgetRepository contract — %s',
  (_name, makeRepository) => {
    it('findById returns what was created and null for another owner', async () => {
      const repository = makeRepository();
      await repository.create(build('budget-1'));
      expect((await repository.findById('budget-1', 'user-1'))?.id).toBe(
        'budget-1',
      );
      expect(await repository.findById('budget-1', 'user-2')).toBeNull();
    });

    it('listActiveByUser hides soft-deleted budgets but findById still sees them', async () => {
      const repository = makeRepository();
      const removed = build('budget-2');
      removed.softDelete('2026-10-02T00:00:00.000Z');
      await repository.create(build('budget-1'));
      await repository.create(removed);
      expect(
        (await repository.listActiveByUser('user-1')).map((b) => b.id),
      ).toEqual(['budget-1']);
      expect((await repository.findById('budget-2', 'user-1'))?.isActive).toBe(
        false,
      );
    });
  },
);
```

Transactional repositories (wallet, transaction-tree, transfer) add cases for atomicity: a failing `work` leaves the store untouched; reads after a write inside the callback throw (the fake enforces it).
