import { RemoveAvatarUseCase } from './remove-avatar.usecase';
import { Person } from '@/features/person/domain/person.entity';
import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';

const NOW = '2026-06-04T17:00:00.000Z';

const makePerson = (avatarUrl: string | null = null) => {
  const person = Person.create({
    id: 'person-1',
    userId: 'user-1',
    email: 'caio@example.com',
    firstName: 'Caio',
    lastName: 'Queiroz',
    createdAt: '2026-06-04T12:00:00.000Z',
  });
  if (avatarUrl) person.changeAvatar(avatarUrl, '2026-06-04T13:00:00.000Z');
  return person;
};

const makeDeps = (person: Person | null) => {
  const repository = {
    create: jest.fn(),
    update: jest.fn(),
    findByUserId: jest.fn().mockResolvedValue(person),
    findByEmail: jest.fn(),
    findByDocument: jest.fn(),
    findByUserIdIncludingDeleted: jest.fn(),
  };
  const storageGateway = {
    upload: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
  };
  const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
  const useCase = RemoveAvatarUseCase.create(
    repository as any,
    storageGateway as any,
    logger as any,
    () => NOW,
  );
  return { repository, storageGateway, logger, useCase };
};

describe('RemoveAvatarUseCase', () => {
  it('deleta objeto do bucket e zera avatarUrl', async () => {
    const person = makePerson('https://bucket/avatars/user-1.png');
    const { useCase, storageGateway, repository } = makeDeps(person);

    await useCase.execute({ userId: 'user-1' });

    expect(storageGateway.delete).toHaveBeenCalledWith('avatars/user-1.jpg');
    expect(storageGateway.delete).toHaveBeenCalledWith('avatars/user-1.png');
    expect(person.avatarUrl).toBeNull();
    expect(repository.update).toHaveBeenCalledWith(person);
  });

  it('sem avatar é no-op: nenhuma interação com bucket ou update', async () => {
    const { useCase, storageGateway, repository } = makeDeps(makePerson());

    await useCase.execute({ userId: 'user-1' });

    expect(storageGateway.delete).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('falha do bucket loga e avatarUrl ainda vira null', async () => {
    const person = makePerson('https://bucket/avatars/user-1.png');
    const { useCase, storageGateway, logger, repository } = makeDeps(person);
    storageGateway.delete.mockRejectedValue(new Error('bucket off'));

    await useCase.execute({ userId: 'user-1' });

    expect(logger.warn).toHaveBeenCalled();
    expect(person.avatarUrl).toBeNull();
    expect(repository.update).toHaveBeenCalledWith(person);
  });

  it('404 quando não há person ativo', async () => {
    const { useCase } = makeDeps(null);
    await expect(useCase.execute({ userId: 'user-1' })).rejects.toBeInstanceOf(
      EntityNotFoundError,
    );
  });
});
