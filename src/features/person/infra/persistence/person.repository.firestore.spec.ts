import { PersonRepositoryFirestore } from '@/features/person/infra/persistence/person.repository.firestore';
import {
  Person,
  PersonPersistence,
} from '@/features/person/domain/person.entity';

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

function makeDb(rows: PersonPersistence[] = []) {
  const get = jest.fn().mockResolvedValue({
    empty: rows.length === 0,
    docs: rows.map((row) => ({ data: () => row })),
  });
  const docSet = jest.fn().mockResolvedValue(undefined);

  const whereCalls: [string, string, unknown][] = [];
  const queryStub: any = {
    where: jest.fn((field: string, op: string, value: unknown) => {
      whereCalls.push([field, op, value]);
      return queryStub;
    }),
    limit: jest.fn(() => queryStub),
    get,
  };
  const collectionStub = {
    doc: jest.fn(() => ({ set: docSet })),
    where: queryStub.where,
  };
  const db = { collection: jest.fn(() => collectionStub) } as any;

  return { db, docSet, whereCalls, collectionStub };
}

describe('PersonRepositoryFirestore', () => {
  it('persiste na collection persons keyed por id', async () => {
    const { db, docSet, collectionStub } = makeDb();
    const repository = PersonRepositoryFirestore.create(db);

    await repository.create(Person.with(persistence()));

    expect(db.collection).toHaveBeenCalledWith('persons');
    expect(collectionStub.doc).toHaveBeenCalledWith('person-1');
    expect(docSet).toHaveBeenCalledWith(persistence());
  });

  it.each([
    ['findByUserId', 'userId', 'user-1'],
    ['findByEmail', 'email', 'caio@example.com'],
    ['findByDocument', 'document.value', '39053344705'],
  ] as const)(
    '%s filtra deletedAt == null por padrão',
    async (method, field, value) => {
      const { db, whereCalls } = makeDb([persistence()]);
      const repository = PersonRepositoryFirestore.create(db);

      const result = await (repository as any)[method](value);

      expect(whereCalls).toEqual([
        [field, '==', value],
        ['deletedAt', '==', null],
      ]);
      expect(result?.toPersistence()).toEqual(persistence());
    },
  );

  it('findByUserIdIncludingDeleted não filtra deletedAt', async () => {
    const deleted = persistence({ deletedAt: '2026-06-04T13:00:00.000Z' });
    const { db, whereCalls } = makeDb([deleted]);
    const repository = PersonRepositoryFirestore.create(db);

    const result = await repository.findByUserIdIncludingDeleted('user-1');

    expect(whereCalls).toEqual([['userId', '==', 'user-1']]);
    expect(result?.toPersistence().deletedAt).toBe('2026-06-04T13:00:00.000Z');
  });

  it('finders retornam null quando a query vem vazia', async () => {
    const { db } = makeDb([]);
    const repository = PersonRepositoryFirestore.create(db);

    expect(await repository.findByUserId('user-x')).toBeNull();
    expect(await repository.findByEmail('x@example.com')).toBeNull();
    expect(await repository.findByDocument('000')).toBeNull();
    expect(await repository.findByUserIdIncludingDeleted('user-x')).toBeNull();
  });

  it('update regrava o documento inteiro pelo id', async () => {
    const { db, docSet, collectionStub } = makeDb();
    const repository = PersonRepositoryFirestore.create(db);
    const person = Person.with(persistence());
    person.softDelete('2026-06-04T15:00:00.000Z');

    await repository.update(person);

    expect(collectionStub.doc).toHaveBeenCalledWith('person-1');
    expect(docSet).toHaveBeenCalledWith(
      expect.objectContaining({ deletedAt: '2026-06-04T15:00:00.000Z' }),
    );
  });
});
