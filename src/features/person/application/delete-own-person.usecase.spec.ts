import { DeleteOwnPersonUseCase } from './delete-own-person.usecase';
import { Person } from '@/features/person/domain/person.entity';
import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';

const NOW = '2026-06-04T18:00:00.000Z';

const makePerson = () =>
  Person.create({
    id: 'person-1',
    userId: 'user-1',
    email: 'caio@example.com',
    firstName: 'Caio',
    lastName: 'Queiroz',
    createdAt: '2026-06-04T12:00:00.000Z',
  });

const makeDeps = (person: Person | null) => {
  const calls: string[] = [];
  const repository = {
    create: jest.fn(),
    update: jest.fn().mockImplementation(async () => {
      calls.push('persist');
    }),
    findByUserId: jest.fn(),
    findByEmail: jest.fn(),
    findByDocument: jest.fn(),
    findByUserIdIncludingDeleted: jest.fn().mockResolvedValue(person),
  };
  const authGateway = {
    disableAccount: jest.fn().mockImplementation(async () => {
      calls.push('disable');
    }),
    revokeRefreshTokens: jest.fn().mockImplementation(async () => {
      calls.push('revoke');
    }),
  };
  const useCase = DeleteOwnPersonUseCase.create(
    repository as any,
    authGateway as any,
    () => NOW,
  );
  return { repository, authGateway, useCase, calls };
};

describe('DeleteOwnPersonUseCase', () => {
  it('runs disable, revoke and deletedAt in that order', async () => {
    const person = makePerson();
    const { useCase, calls } = makeDeps(person);

    await useCase.execute({ userId: 'user-1' });

    expect(calls).toEqual(['disable', 'revoke', 'persist']);
    expect(person.toPersistence().deletedAt).toBe(NOW);
  });

  it('fails at disable (step 1) and mutates nothing', async () => {
    const person = makePerson();
    const { useCase, authGateway, repository } = makeDeps(person);
    authGateway.disableAccount.mockRejectedValue(new Error('auth off'));

    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrow(
      'auth off',
    );
    expect(authGateway.revokeRefreshTokens).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
    expect(person.toPersistence().deletedAt).toBeNull();
  });

  it('fails at revoke and leaves a safe state: account locked, profile alive', async () => {
    const person = makePerson();
    const { useCase, authGateway, repository } = makeDeps(person);
    authGateway.revokeRefreshTokens.mockRejectedValue(new Error('auth off'));

    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrow();
    expect(authGateway.disableAccount).toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
    expect(person.toPersistence().deletedAt).toBeNull();
  });

  it('re-delete is idempotent: original deletedAt is preserved', async () => {
    const person = makePerson();
    person.softDelete('2026-06-01T00:00:00.000Z');
    const { useCase, calls } = makeDeps(person);

    await useCase.execute({ userId: 'user-1' });

    expect(calls).toEqual(['disable', 'revoke', 'persist']);
    expect(person.toPersistence().deletedAt).toBe('2026-06-01T00:00:00.000Z');
  });

  it('404 when no person exists, deleted or not', async () => {
    const { useCase, authGateway } = makeDeps(null);
    await expect(useCase.execute({ userId: 'user-1' })).rejects.toBeInstanceOf(
      EntityNotFoundError,
    );
    expect(authGateway.disableAccount).not.toHaveBeenCalled();
  });
});
