import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { PersonRepository } from '@/features/person/domain/ports/person.repository.port';
import { StorageGateway } from '@/features/person/domain/ports/storage.gateway.port';
import { LoggerGateway } from '@/shared/logger/logger.gateway';
import { avatarStoragePaths } from '@/features/person/application/avatar-storage-paths';

interface RemoveAvatarInput {
  userId: string;
}

export class RemoveAvatarUseCase {
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
  ): RemoveAvatarUseCase {
    return new RemoveAvatarUseCase(repository, storageGateway, logger, now);
  }

  public async execute(input: RemoveAvatarInput): Promise<void> {
    const person = await this.repository.findByUserId(input.userId);
    if (!person) throw new EntityNotFoundError(ErrorCode.PERSON_NOT_FOUND);
    if (!person.avatarUrl) return;

    for (const path of avatarStoragePaths.allCandidates(input.userId)) {
      try {
        await this.storageGateway.delete(path);
      } catch (error) {
        this.logger.warn(
          `[AVATAR] falha best-effort ao deletar ${path}: ${error}`,
        );
      }
    }

    person.removeAvatar(this.now());
    await this.repository.update(person);
  }
}
