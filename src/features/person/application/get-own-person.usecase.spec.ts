import { GetOwnPersonUseCase } from './get-own-person.usecase';
import { Person } from '@/features/person/domain/person.entity';
import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const makeRepository = () => ({
  create: jest.fn(),
  update: jest.fn(),
  findByUserId: jest.fn().mockResolvedValue(null),
  findByEmail: jest.fn(),
  findByDocument: jest.fn(),
  findByUserIdIncludingDeleted: jest.fn(),
});

const makeAuthGateway = () => ({
  disableAccount: jest.fn(),
  revokeRefreshTokens: jest.fn(),
});

const makePerson = () =>
  Person.create({
    id: 'person-1',
    userId: 'user-1',
    email: 'caio@example.com',
    firstName: 'Caio',
    lastName: 'Queiroz',
    createdAt: '2026-06-04T12:00:00.000Z',
  });

describe('GetOwnPersonUseCase', () => {
  it('retorna o person ativo do userId', async () => {
    const repository = makeRepository();
    const authGateway = makeAuthGateway();
    const person = makePerson();
    repository.findByUserId.mockResolvedValue(person);

    const result = await GetOwnPersonUseCase.create(
      repository,
      authGateway,
    ).execute({ userId: 'user-1' });

    expect(result).toBe(person);
    expect(authGateway.revokeRefreshTokens).not.toHaveBeenCalled();
  });

  it('sessão órfã: revoga refresh tokens antes do PERSON_NOT_FOUND', async () => {
    const repository = makeRepository();
    const authGateway = makeAuthGateway();

    const promise = GetOwnPersonUseCase.create(repository, authGateway).execute(
      { userId: 'user-1' },
    );
    await expect(promise).rejects.toBeInstanceOf(EntityNotFoundError);
    await expect(promise).rejects.toMatchObject({
      code: ErrorCode.PERSON_NOT_FOUND,
    });
    expect(authGateway.revokeRefreshTokens).toHaveBeenCalledWith('user-1');
  });

  it('person deletado é tratado como inexistente (finder padrão filtra)', async () => {
    const repository = makeRepository();
    const authGateway = makeAuthGateway();
    repository.findByUserId.mockResolvedValue(null);

    await expect(
      GetOwnPersonUseCase.create(repository, authGateway).execute({
        userId: 'user-1',
      }),
    ).rejects.toThrow(EntityNotFoundError);
  });
});
