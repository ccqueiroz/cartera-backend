import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { Person } from '@/features/person/domain/person.entity';
import { PersonRepository } from '@/features/person/domain/ports/person.repository.port';
import { StorageGateway } from '@/features/person/domain/ports/storage.gateway.port';
import { LoggerGateway } from '@/shared/logger/logger.gateway';
import { avatarStoragePaths } from '@/features/person/application/avatar-storage-paths';

interface ReplaceAvatarInput {
  userId: string;
  buffer: Buffer;
  contentType: string;
}

export class ReplaceAvatarUseCase {
  private constructor(
    private readonly repository: PersonRepository,
    private readonly storageGateway: StorageGateway,
    private readonly logger: LoggerGateway,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: PersonRepository,
    storageGateway: StorageGateway,
    logger: LoggerGateway,
    now: () => string,
  ): ReplaceAvatarUseCase {
    return new ReplaceAvatarUseCase(repository, storageGateway, logger, now);
  }

  public async execute(input: ReplaceAvatarInput): Promise<Person> {
    const person = await this.repository.findByUserId(input.userId);
    if (!person) throw new EntityNotFoundError(ErrorCode.PERSON_NOT_FOUND);

    const path = avatarStoragePaths.forUpload(input.userId, input.contentType);
    let avatarUrl: string;
    try {
      avatarUrl = await this.storageGateway.upload(
        path,
        input.buffer,
        input.contentType,
      );
    } catch (error) {
      this.logger.error(`[AVATAR] upload falhou para ${path}: ${error}`);
      // Não-domínio de propósito: falha de gateway vira 500 genérico na borda (D7).
      throw new Error(ErrorCode.AVATAR_UPLOAD_FAILED);
    }

    const previousAvatarUrl = person.avatarUrl;
    person.changeAvatar(avatarUrl, this.now());
    await this.repository.update(person);

    if (previousAvatarUrl) {
      const stalePaths = avatarStoragePaths
        .allCandidates(input.userId)
        .filter((candidate) => candidate !== path);
      for (const stalePath of stalePaths) {
        try {
          await this.storageGateway.delete(stalePath);
        } catch (error) {
          this.logger.warn(
            `[AVATAR] falha best-effort ao deletar imagem antiga ${stalePath}: ${error}`,
          );
        }
      }
    }

    return person;
  }
}
