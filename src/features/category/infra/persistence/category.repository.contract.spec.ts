import { Firestore } from 'firebase-admin/firestore';
import {
  Category,
  CategoryPersistence,
} from '@/features/category/domain/category.entity';
import { CategoryDescriptionEnum } from '@/features/category/domain/enums/category-description.enum';
import { CategoryGroupEnum } from '@/features/category/domain/enums/category-group.enum';
import { CategoryRepository } from '@/features/category/domain/ports/category.repository.port';
import { CategoryRepositoryFirestore } from '@/features/category/infra/persistence/category.repository.firestore';
import { TransactionTypeEnum } from '@/shared/kernel/enums/transaction-type.enum';
import { firestoreEmulator } from '@/test/support/firestore-emulator';

jest.setTimeout(60_000);

let db: Firestore;

beforeAll(async () => {
  db = await firestoreEmulator.connect();
});
beforeEach(() => firestoreEmulator.clear());
afterAll(() => db.terminate());

const { BILLS, RECEIVABLES } = TransactionTypeEnum;
const { FOOD, TRANSPORT, HOUSING, REVENUES } = CategoryGroupEnum;
const { RESTAURANT, FAST_FOOD, BUS, RENT, SALARY } = CategoryDescriptionEnum;
const EDITED_AT = '2026-02-01T00:00:00.000Z';
const DELETED_AT = '2026-03-01T00:00:00.000Z';

function persistence(
  overrides: Partial<CategoryPersistence> = {},
): CategoryPersistence {
  return {
    id: 'cat-1',
    description: 'Restaurant',
    descriptionEnum: RESTAURANT,
    group: FOOD,
    type: BILLS,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: null,
    deletedAt: null,
    ...overrides,
  };
}

const fastFood = persistence({
  id: 'cat-2',
  description: 'Fast food',
  descriptionEnum: FAST_FOOD,
});
const bus = persistence({
  id: 'cat-3',
  description: 'Bus',
  descriptionEnum: BUS,
  group: TRANSPORT,
});
const deletedRent = persistence({
  id: 'cat-4',
  description: 'Rent',
  descriptionEnum: RENT,
  group: HOUSING,
  deletedAt: DELETED_AT,
});
const salary = persistence({
  id: 'cat-5',
  description: 'Salary',
  descriptionEnum: SALARY,
  group: REVENUES,
  type: RECEIVABLES,
});

// Seeded straight into Category, so the finders also prove the collection name.
const seed = (...rows: CategoryPersistence[]) =>
  Promise.all(
    rows.map((row) => db.collection('Category').doc(row.id).set(row)),
  );

const reread = async (found: Promise<Category | null>) =>
  (await found)?.toPersistence() ?? null;

const rereadAll = async (listed: Promise<Category[]>) =>
  (await listed).map((category) => category.toPersistence());

const ids = async (listed: Promise<Category[]>) =>
  (await listed).map((category) => category.id).sort();

const adapters: [string, () => CategoryRepository][] = [
  ['firestore (emulator)', () => CategoryRepositoryFirestore.create(db)],
];

describe.each(adapters)(
  'CategoryRepository contract - %s',
  (_name, makeRepository) => {
    it('[BK3-15] findActiveByType returns only the active categories of the type', async () => {
      await seed(persistence(), fastFood, deletedRent, salary);

      expect(await ids(makeRepository().findActiveByType(BILLS))).toEqual([
        'cat-1',
        'cat-2',
      ]);
    });

    it('[BK3-15] findActiveByEnum returns the active category of the enum, with an active category of another enum as a decoy', async () => {
      await seed(fastFood, persistence());

      expect(
        await reread(makeRepository().findActiveByEnum(RESTAURANT)),
      ).toEqual(persistence());
    });

    it('[BK3-15] findActiveByEnum returns null when the enum only has a deleted category', async () => {
      await seed(persistence({ deletedAt: DELETED_AT }));

      expect(await makeRepository().findActiveByEnum(RESTAURANT)).toBeNull();
    });

    it('[BK3-15] findByEnum returns the category of the enum even when it is deleted, with an active category of another enum as a decoy', async () => {
      await seed(fastFood, deletedRent);

      expect(await reread(makeRepository().findByEnum(RENT))).toEqual(
        deletedRent,
      );
    });

    it('[BK3-15] findByEnum returns null when the enum has no category, with an active category of another enum as a decoy', async () => {
      await seed(fastFood);

      expect(await makeRepository().findByEnum(RESTAURANT)).toBeNull();
    });

    it('[BK3-15] listGroupsByType returns the distinct groups of the active categories of the type', async () => {
      await seed(persistence(), fastFood, bus, deletedRent, salary);

      const groups = await makeRepository().listGroupsByType(BILLS);

      expect(groups.sort()).toEqual([FOOD, TRANSPORT]);
    });

    it('[BK3-15] findActiveByGroupAndType returns only the active categories of the group and the type', async () => {
      await seed(
        persistence(),
        { ...fastFood, deletedAt: DELETED_AT },
        bus,
        persistence({ id: 'cat-6', type: RECEIVABLES }),
      );

      expect(
        await ids(makeRepository().findActiveByGroupAndType(FOOD, BILLS)),
      ).toEqual(['cat-1']);
    });

    it('[BK3-15] create writes the category under its id, so a second create of the same id rewrites it', async () => {
      const repository = makeRepository();

      await repository.create(Category.with(persistence()));
      await repository.create(
        Category.with(persistence({ description: 'Restaurants' })),
      );

      expect(await rereadAll(repository.findActiveByType(BILLS))).toEqual([
        persistence({ description: 'Restaurants' }),
      ]);
    });

    it('[BK3-15] update rewrites the category by id', async () => {
      const repository = makeRepository();
      await seed(persistence());
      const edited = Category.with(persistence());
      edited.edit({
        description: 'Restaurants',
        group: FOOD,
        type: BILLS,
        updatedAt: EDITED_AT,
      });

      await repository.update(edited);

      expect(await rereadAll(repository.findActiveByType(BILLS))).toEqual([
        persistence({ description: 'Restaurants', updatedAt: EDITED_AT }),
      ]);
    });

    it('[BK3-15] softDelete rewrites the category by id', async () => {
      const repository = makeRepository();
      await seed(persistence());
      const removed = Category.with(persistence());
      removed.softDelete(DELETED_AT);

      await repository.softDelete(removed);

      expect(await repository.findActiveByType(BILLS)).toEqual([]);
      expect(await reread(repository.findByEnum(RESTAURANT))).toEqual(
        persistence({ deletedAt: DELETED_AT, updatedAt: DELETED_AT }),
      );
    });
  },
);
