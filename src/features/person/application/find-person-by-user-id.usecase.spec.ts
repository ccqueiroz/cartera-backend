import { FindPersonByUserIdUseCase } from './find-person-by-user-id.usecase';
import { Person } from '@/features/person/domain/person.entity';

const makeRepository = (result: Person | null) => ({
  create: jest.fn(),
  update: jest.fn(),
  findByUserId: jest.fn().mockResolvedValue(result),
  findByEmail: jest.fn(),
  findByDocument: jest.fn(),
  findByUserIdIncludingDeleted: jest.fn(),
});

describe('FindPersonByUserIdUseCase', () => {
  it('retorna o person ativo do userId', async () => {
    const person = {} as Person;
    const repository = makeRepository(person);
    const result = await FindPersonByUserIdUseCase.create(
      repository as any,
    ).execute({ userId: 'user-1' });
    expect(result).toBe(person);
  });

  it('miss retorna null sem revogar credenciais', async () => {
    const repository = makeRepository(null);
    const result = await FindPersonByUserIdUseCase.create(
      repository as any,
    ).execute({ userId: 'user-1' });
    expect(result).toBeNull();
  });
});
