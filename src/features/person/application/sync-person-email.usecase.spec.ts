import { SyncPersonEmailUseCase } from './sync-person-email.usecase';
import { Person } from '@/features/person/domain/person.entity';
import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';

const NOW = '2026-06-04T19:00:00.000Z';

const makePerson = () =>
  Person.create({
    id: 'person-1',
    userId: 'user-1',
    email: 'antigo@example.com',
    firstName: 'Caio',
    lastName: 'Queiroz',
    createdAt: '2026-06-04T12:00:00.000Z',
  });

const makeRepository = (person: Person | null) => ({
  create: jest.fn(),
  update: jest.fn(),
  findByUserId: jest.fn().mockResolvedValue(person),
  findByEmail: jest.fn(),
  findByDocument: jest.fn(),
  findByUserIdIncludingDeleted: jest.fn(),
});

describe('SyncPersonEmailUseCase', () => {
  it('atualiza o email espelho e seta updatedAt', async () => {
    const person = makePerson();
    const repository = makeRepository(person);

    await SyncPersonEmailUseCase.create(repository as any, () => NOW).execute({
      userId: 'user-1',
      email: 'novo@example.com',
    });

    expect(person.email).toBe('novo@example.com');
    expect(person.toPersistence().updatedAt).toBe(NOW);
    expect(repository.update).toHaveBeenCalledWith(person);
  });

  it('404 quando não há person ativo para o userId', async () => {
    const repository = makeRepository(null);
    await expect(
      SyncPersonEmailUseCase.create(repository as any, () => NOW).execute({
        userId: 'user-1',
        email: 'novo@example.com',
      }),
    ).rejects.toBeInstanceOf(EntityNotFoundError);
  });
});
