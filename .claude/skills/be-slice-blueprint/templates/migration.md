# Seed migration

`migrations-firebase/NNN-<verb>-<thing>.ts`, next number, new file per addition. The runner (`scripts/run-migrations-firebase.ts`) records by file name and skips what already ran: never edit a migration that ran, add a new one. Idempotent by business key; writes the full document shape with `deletedAt: null` when the collection is soft-deletable; instants `new Date().toISOString()`; enums imported from `src` so the seeded value equals the domain's; never deletes or rewrites existing documents.

```ts
import * as admin from 'firebase-admin';
import { randomUUID } from 'crypto';
import { CategoryDescriptionEnum } from '../src/features/category/domain/enums/category-description.enum';
import { CategoryGroupEnum } from '../src/features/category/domain/enums/category-group.enum';
import { TransactionTypeEnum } from '../src/shared/kernel/enums/transaction-type.enum';

const newCategories = [
  {
    description: 'Orçamento familiar',
    descriptionEnum: CategoryDescriptionEnum.OTHER_EXPENSES,
    group: CategoryGroupEnum.OTHERS,
    type: TransactionTypeEnum.BILLS,
  },
];

export default async function (db: admin.firestore.Firestore) {
  const categories = db.collection('Category');
  for (const category of newCategories) {
    const existing = await categories
      .where('descriptionEnum', '==', category.descriptionEnum)
      .limit(1)
      .get();
    if (!existing.empty) continue;
    const id = randomUUID();
    await categories
      .doc(id)
      .set({
        id,
        ...category,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        deletedAt: null,
      });
  }
}
```

Spec next to it with the Firestore fake (`be-tests` → migration-spec): seeded shape + idempotence. Running `yarn migrate` is blocked for agents (workspace hooks): the migration ships in the PR, the Caio runs it.
