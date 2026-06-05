import { UpdateOwnPersonUseCase } from './update-own-person.usecase';
import { Person } from '@/features/person/domain/person.entity';
import {
  DuplicateEntityError,
  EntityNotFoundError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const NOW = '2026-06-04T14:00:00.000Z';
const VALID_CPF = '39053344705';

const makePerson = (userId = 'user-1') =>
  Person.create({
    id: `person-${userId}`,
    userId,
    email: 'caio@example.com',
    firstName: 'Caio',
    lastName: 'Queiroz',
    createdAt: '2026-06-04T12:00:00.000Z',
  });

const makeRepository = () => ({
  create: jest.fn(),
  update: jest.fn(),
  findByUserId: jest.fn().mockResolvedValue(null),
  findByEmail: jest.fn(),
  findByDocument: jest.fn().mockResolvedValue(null),
  findByUserIdIncludingDeleted: jest.fn(),
});

const makeUseCase = (repository: any) =>
  UpdateOwnPersonUseCase.create(repository, () => NOW);

describe('UpdateOwnPersonUseCase', () => {
  it('aplica campos editáveis, persiste puro e seta updatedAt', async () => {
    const repository = makeRepository();
    repository.findByUserId.mockResolvedValue(makePerson());

    const person = await makeUseCase(repository).execute({
      userId: 'user-1',
      firstName: 'Cezar',
      document: { type: 'CPF', value: '390.533.447-05' },
      birthDate: '1990-01-15',
    });

    expect(repository.update).toHaveBeenCalledWith(person);
    const persisted = person.toPersistence();
    expect(persisted.firstName).toBe('Cezar');
    expect(persisted.document).toEqual({ type: 'CPF', value: VALID_CPF });
    expect(persisted.updatedAt).toBe(NOW);
    expect(person.toOutput().document?.value).toBe('390.xxx.xxx-05');
  });

  it('404 quando não há person ativo para o userId', async () => {
    const repository = makeRepository();
    const promise = makeUseCase(repository).execute({
      userId: 'user-1',
      firstName: 'Cezar',
    });
    await expect(promise).rejects.toBeInstanceOf(EntityNotFoundError);
    await expect(promise).rejects.toMatchObject({
      code: ErrorCode.PERSON_NOT_FOUND,
    });
  });

  it('document de outro person → DOCUMENT_ALREADY_IN_USE', async () => {
    const repository = makeRepository();
    repository.findByUserId.mockResolvedValue(makePerson());
    repository.findByDocument.mockResolvedValue(makePerson('user-2'));

    const promise = makeUseCase(repository).execute({
      userId: 'user-1',
      document: { type: 'CPF', value: VALID_CPF },
    });
    await expect(promise).rejects.toBeInstanceOf(DuplicateEntityError);
    await expect(promise).rejects.toMatchObject({
      code: ErrorCode.DOCUMENT_ALREADY_IN_USE,
    });
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('document já do próprio person não conflita', async () => {
    const repository = makeRepository();
    repository.findByUserId.mockResolvedValue(makePerson());
    repository.findByDocument.mockResolvedValue(makePerson('user-1'));

    await expect(
      makeUseCase(repository).execute({
        userId: 'user-1',
        document: { type: 'CPF', value: VALID_CPF },
      }),
    ).resolves.toBeInstanceOf(Person);
  });

  it('busca de unicidade usa o document sanitizado (só dígitos)', async () => {
    const repository = makeRepository();
    repository.findByUserId.mockResolvedValue(makePerson());

    await makeUseCase(repository).execute({
      userId: 'user-1',
      document: { type: 'CPF', value: '390.533.447-05' },
    });
    expect(repository.findByDocument).toHaveBeenCalledWith(VALID_CPF);
  });
});
