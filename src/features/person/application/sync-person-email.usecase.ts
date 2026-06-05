import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { Person } from '@/features/person/domain/person.entity';
import { PersonRepository } from '@/features/person/domain/ports/person.repository.port';

interface SyncPersonEmailInput {
  userId: string;
  email: string;
}

export class SyncPersonEmailUseCase {
  private constructor(
    private readonly repository: PersonRepository,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: PersonRepository,
    now: () => string,
  ): SyncPersonEmailUseCase {
    return new SyncPersonEmailUseCase(repository, now);
  }

  public async execute(input: SyncPersonEmailInput): Promise<Person> {
    const person = await this.repository.findByUserId(input.userId);
    if (!person) throw new EntityNotFoundError(ErrorCode.PERSON_NOT_FOUND);

    person.syncEmail(input.email, this.now());
    await this.repository.update(person);
    return person;
  }
}
