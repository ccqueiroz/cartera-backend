import { ReplaceAvatarUseCase } from './replace-avatar.usecase';
import { Person } from '@/features/person/domain/person.entity';
import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const NOW = '2026-06-04T16:00:00.000Z';
const NEW_URL = 'https://bucket/avatars/user-1.png';

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
    upload: jest.fn().mockResolvedValue(NEW_URL),
    delete: jest.fn().mockResolvedValue(undefined),
  };
  const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
  const useCase = ReplaceAvatarUseCase.create(
    repository as any,
    storageGateway as any,
    logger as any,
    () => NOW,
  );
  return { repository, storageGateway, logger, useCase };
};

const input = {
  userId: 'user-1',
  buffer: Buffer.from('image'),
  contentType: 'image/png',
};

describe('ReplaceAvatarUseCase', () => {
  it('faz upload no path determinístico e grava avatarUrl', async () => {
    const { useCase, storageGateway, repository } = makeDeps(makePerson());

    const person = await useCase.execute(input);

    expect(storageGateway.upload).toHaveBeenCalledWith(
      'avatars/user-1.png',
      input.buffer,
      'image/png',
    );
    expect(person.avatarUrl).toBe(NEW_URL);
    expect(repository.update).toHaveBeenCalledWith(person);
  });

  it('404 quando não há person ativo', async () => {
    const { useCase } = makeDeps(null);
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      EntityNotFoundError,
    );
  });

  it('falha de upload vira erro não-domínio AVATAR_UPLOAD_FAILED sem mutar estado', async () => {
    const { useCase, storageGateway, repository, logger } = makeDeps(
      makePerson(),
    );
    storageGateway.upload.mockRejectedValue(new Error('bucket off'));

    const promise = useCase.execute(input);
    await expect(promise).rejects.toThrow(ErrorCode.AVATAR_UPLOAD_FAILED);
    await expect(promise).rejects.not.toBeInstanceOf(EntityNotFoundError);
    expect(repository.update).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });

  it('deleta extensão antiga best-effort quando havia avatar', async () => {
    const { useCase, storageGateway } = makeDeps(
      makePerson('https://bucket/avatars/user-1.jpg'),
    );

    await useCase.execute(input);

    expect(storageGateway.delete).toHaveBeenCalledWith('avatars/user-1.jpg');
    expect(storageGateway.delete).not.toHaveBeenCalledWith(
      'avatars/user-1.png',
    );
  });

  it('não chama delete quando não havia avatar anterior', async () => {
    const { useCase, storageGateway } = makeDeps(makePerson());
    await useCase.execute(input);
    expect(storageGateway.delete).not.toHaveBeenCalled();
  });

  it('falha no delete da imagem antiga loga e a request sucede', async () => {
    const { useCase, storageGateway, logger } = makeDeps(
      makePerson('https://bucket/avatars/user-1.jpg'),
    );
    storageGateway.delete.mockRejectedValue(new Error('gone'));

    const person = await useCase.execute(input);

    expect(person.avatarUrl).toBe(NEW_URL);
    expect(logger.warn).toHaveBeenCalled();
  });
});
