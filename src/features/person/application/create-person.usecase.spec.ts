import { CreatePersonUseCase } from './create-person.usecase';
import { Person } from '@/features/person/domain/person.entity';
import { DuplicateEntityError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const makeRepository = () => ({
  create: jest.fn(),
  update: jest.fn(),
  findByUserId: jest.fn().mockResolvedValue(null),
  findByEmail: jest.fn().mockResolvedValue(null),
  findByDocument: jest.fn().mockResolvedValue(null),
  findByUserIdIncludingDeleted: jest.fn().mockResolvedValue(null),
});

const NOW = '2026-06-04T12:00:00.000Z';

const makeUseCase = (repository: any) =>
  CreatePersonUseCase.create(
    repository,
    () => 'person-1',
    () => NOW,
  );

const input = {
  userId: 'user-1',
  email: 'caio@example.com',
  firstName: 'Caio',
  lastName: 'Queiroz',
};

describe('CreatePersonUseCase', () => {
  it('cria person ativo com createdAt e email espelho', async () => {
    const repository = makeRepository();
    const person = await makeUseCase(repository).execute(input);

    expect(repository.create).toHaveBeenCalledWith(person);
    const persisted = person.toPersistence();
    expect(persisted.deletedAt).toBeNull();
    expect(persisted.createdAt).toBe(NOW);
    expect(persisted.email).toBe('caio@example.com');
    expect(person.toOutput().fullName).toBe('Caio Queiroz');
    expect(person.toOutput().isActive).toBe(true);
  });

  it('rejeita userId que já tem person com PERSON_ALREADY_EXISTS', async () => {
    const repository = makeRepository();
    repository.findByUserIdIncludingDeleted.mockResolvedValue({} as Person);

    const promise = makeUseCase(repository).execute(input);
    await expect(promise).rejects.toBeInstanceOf(DuplicateEntityError);
    await expect(promise).rejects.toMatchObject({
      code: ErrorCode.PERSON_ALREADY_EXISTS,
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('unicidade considera person deletado (soft delete terminal)', async () => {
    const repository = makeRepository();
    repository.findByUserIdIncludingDeleted.mockResolvedValue({} as Person);
    repository.findByUserId.mockResolvedValue(null);

    await expect(makeUseCase(repository).execute(input)).rejects.toThrow(
      DuplicateEntityError,
    );
  });
});
