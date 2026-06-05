import { FindPersonByEmailUseCase } from './find-person-by-email.usecase';
import { Person } from '@/features/person/domain/person.entity';

const makeRepository = (result: Person | null) => ({
  create: jest.fn(),
  update: jest.fn(),
  findByUserId: jest.fn(),
  findByEmail: jest.fn().mockResolvedValue(result),
  findByDocument: jest.fn(),
  findByUserIdIncludingDeleted: jest.fn(),
});

describe('FindPersonByEmailUseCase', () => {
  it('retorna o person ativo do email', async () => {
    const person = {} as Person;
    const repository = makeRepository(person);
    const result = await FindPersonByEmailUseCase.create(
      repository as any,
    ).execute({ email: 'caio@example.com' });
    expect(result).toBe(person);
    expect(repository.findByEmail).toHaveBeenCalledWith('caio@example.com');
  });

  it('miss retorna null sem side effects', async () => {
    const repository = makeRepository(null);
    const result = await FindPersonByEmailUseCase.create(
      repository as any,
    ).execute({ email: 'x@example.com' });
    expect(result).toBeNull();
    expect(repository.update).not.toHaveBeenCalled();
  });
});
