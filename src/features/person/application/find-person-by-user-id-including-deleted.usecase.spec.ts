import { FindPersonByUserIdIncludingDeletedUseCase } from './find-person-by-user-id-including-deleted.usecase';
import {
  Person,
  PersonPersistence,
} from '@/features/person/domain/person.entity';

const deletedPersistence: PersonPersistence = {
  id: 'person-1',
  userId: 'user-1',
  email: 'caio@example.com',
  firstName: 'Caio',
  lastName: 'Queiroz',
  phone: null,
  document: null,
  avatarUrl: null,
  birthDate: null,
  occupation: null,
  monthlyIncome: { value: null, currency: null },
  defaultCurrency: null,
  createdAt: '2026-06-04T12:00:00.000Z',
  updatedAt: '2026-06-04T13:00:00.000Z',
  deletedAt: '2026-06-04T13:00:00.000Z',
};

const makeRepository = (result: Person | null) => ({
  create: jest.fn(),
  update: jest.fn(),
  findByUserId: jest.fn(),
  findByEmail: jest.fn(),
  findByDocument: jest.fn(),
  findByUserIdIncludingDeleted: jest.fn().mockResolvedValue(result),
});

describe('FindPersonByUserIdIncludingDeletedUseCase', () => {
  it('retorna person deletado com deletedAt preenchido', async () => {
    const person = Person.with(deletedPersistence);
    const repository = makeRepository(person);

    const result = await FindPersonByUserIdIncludingDeletedUseCase.create(
      repository as any,
    ).execute({ userId: 'user-1' });

    expect(result?.toPersistence().deletedAt).toBe('2026-06-04T13:00:00.000Z');
    expect(result?.isActive).toBe(false);
  });

  it('miss retorna null', async () => {
    const repository = makeRepository(null);
    const result = await FindPersonByUserIdIncludingDeletedUseCase.create(
      repository as any,
    ).execute({ userId: 'user-1' });
    expect(result).toBeNull();
  });
});
