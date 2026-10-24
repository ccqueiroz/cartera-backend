# Repositories: Firestore adapter and in-memory reference

## `infra/persistence/<feature>.repository.firestore.ts`

```ts
import { Firestore } from 'firebase-admin/firestore';
import {
  Budget,
  BudgetPersistence,
} from '@/features/budget/domain/budget.entity';
import { BudgetRepository } from '@/features/budget/domain/ports/budget.repository.port';

export class BudgetRepositoryFirestore implements BudgetRepository {
  private static readonly COLLECTION = 'Budget';
  private constructor(private readonly db: Firestore) {}
  public static create(db: Firestore): BudgetRepositoryFirestore {
    return new BudgetRepositoryFirestore(db);
  }

  public async findActiveById(
    id: string,
    userId: string,
  ): Promise<Budget | null> {
    const budget = await this.findById(id, userId);
    return budget?.isActive ? budget : null;
  }

  public async findById(id: string, userId: string): Promise<Budget | null> {
    const doc = await this.collection().doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as BudgetPersistence;
    if (data.userId !== userId) return null;
    return Budget.with(data);
  }

  public async listActiveByUser(userId: string): Promise<Budget[]> {
    const query = await this.collection()
      .where('userId', '==', userId)
      .where('deletedAt', '==', null)
      .get();
    return query.docs.map((doc) =>
      Budget.with(doc.data() as BudgetPersistence),
    );
  }

  public async create(budget: Budget): Promise<void> {
    await this.collection().doc(budget.id).set(budget.toPersistence());
  }
  public async update(budget: Budget): Promise<void> {
    await this.collection().doc(budget.id).set(budget.toPersistence());
  }
  private collection() {
    return this.db.collection(BudgetRepositoryFirestore.COLLECTION);
  }
}
```

Firestore facts the adapter must respect: `where('x', '==', null)` matches only a present `null` (so every soft-deletable document carries `deletedAt: null`); one range filter per query, the rest in memory (`matchesLeafFilters` is the pattern); composite queries need an entry in `src/shared/database/firebase/firestore.indexes.json`; in `runTransaction` every read precedes the first write; `set` with an `undefined` field throws; `.limit(1)` without `orderBy` is undefined order. Only this class names the collection; another feature reaches it through the owner's `internal`.

## `infra/persistence/in-memory-<feature>.repository.ts`

Same port, a `Map<string, Entity>`, same owner and active rules. It is the reference implementation: use case specs use it, never `jest.fn()` per method. Both adapters pass the same contract spec (`be-tests` → repository-contract-spec).
