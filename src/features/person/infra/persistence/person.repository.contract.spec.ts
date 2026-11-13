import { Firestore } from 'firebase-admin/firestore';
import {
  Person,
  PersonPersistence,
} from '@/features/person/domain/person.entity';
import { PersonRepository } from '@/features/person/domain/ports/person.repository.port';
import { PersonRepositoryFirestore } from '@/features/person/infra/persistence/person.repository.firestore';
import { firestoreEmulator } from '@/test/support/firestore-emulator';

jest.setTimeout(60_000);

let db: Firestore;

beforeAll(async () => {
  db = await firestoreEmulator.connect();
});
beforeEach(() => firestoreEmulator.clear());
afterAll(() => db.terminate());

const DELETED_AT = '2026-06-04T13:00:00.000Z';

function persistence(
  overrides: Partial<PersonPersistence> = {},
): PersonPersistence {
  return {
    id: 'person-1',
    userId: 'user-1',
    email: 'caio@example.com',
    firstName: 'Caio',
    lastName: 'Queiroz',
    phone: null,
    document: { type: 'CPF', value: '39053344705' },
    avatarUrl: null,
    birthDate: null,
    occupation: null,
    monthlyIncome: { value: null, currency: null },
    defaultCurrency: null,
    createdAt: '2026-06-04T12:00:00.000Z',
    updatedAt: null,
    deletedAt: null,
    ...overrides,
  };
}

const reread = async (found: Promise<Person | null>) =>
  (await found)?.toPersistence() ?? null;

const adapters: [string, () => PersonRepository][] = [
  ['firestore (emulator)', () => PersonRepositoryFirestore.create(db)],
];

describe.each(adapters)(
  'PersonRepository contract - %s',
  (_name, makeRepository) => {
    it('[BK3-11] create then findByUserId, findByEmail and findByDocument return the person', async () => {
      const repository = makeRepository();
      await repository.create(Person.with(persistence()));

      expect(await reread(repository.findByUserId('user-1'))).toEqual(
        persistence(),
      );
      expect(await reread(repository.findByEmail('caio@example.com'))).toEqual(
        persistence(),
      );
      expect(await reread(repository.findByDocument('39053344705'))).toEqual(
        persistence(),
      );
    });

    it('[BK3-11] the three active finders return null for a person with deletedAt, which findByUserIdIncludingDeleted still returns', async () => {
      const repository = makeRepository();
      const deleted = persistence({ deletedAt: DELETED_AT });
      await repository.create(Person.with(deleted));

      expect(await repository.findByUserId('user-1')).toBeNull();
      expect(await repository.findByEmail('caio@example.com')).toBeNull();
      expect(await repository.findByDocument('39053344705')).toBeNull();
      expect(
        await reread(repository.findByUserIdIncludingDeleted('user-1')),
      ).toEqual(deleted);
    });

    it('[BK3-11] the four finders return null when nothing matches', async () => {
      const repository = makeRepository();
      await repository.create(Person.with(persistence()));

      expect(await repository.findByUserId('user-x')).toBeNull();
      expect(await repository.findByEmail('x@example.com')).toBeNull();
      expect(await repository.findByDocument('000')).toBeNull();
      expect(
        await repository.findByUserIdIncludingDeleted('user-x'),
      ).toBeNull();
    });

    it('[BK3-11] update rewrites the document by id', async () => {
      const repository = makeRepository();
      await repository.create(Person.with(persistence()));
      const removed = Person.with(persistence());
      removed.softDelete(DELETED_AT);

      await repository.update(removed);

      expect(await repository.findByUserId('user-1')).toBeNull();
      expect(
        await reread(repository.findByUserIdIncludingDeleted('user-1')),
      ).toEqual(persistence({ deletedAt: DELETED_AT, updatedAt: DELETED_AT }));
    });
  },
);
