import {
  DuplicateEntityError,
  EntityNotFoundError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import {
  Person,
  PersonUpdateInput,
} from '@/features/person/domain/person.entity';
import { PersonRepository } from '@/features/person/domain/ports/person.repository.port';

interface UpdateOwnPersonInput extends PersonUpdateInput {
  userId: string;
}

export class UpdateOwnPersonUseCase {
  private constructor(
    private readonly repository: PersonRepository,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: PersonRepository,
    now: () => string,
  ): UpdateOwnPersonUseCase {
    return new UpdateOwnPersonUseCase(repository, now);
  }

  public async execute(input: UpdateOwnPersonInput): Promise<Person> {
    const { userId, ...fields } = input;
    const person = await this.repository.findByUserId(userId);
    if (!person) throw new EntityNotFoundError(ErrorCode.PERSON_NOT_FOUND);

    if (fields.document) {
      const documentDigits = fields.document.value.replace(/\D/g, '');
      const owner = await this.repository.findByDocument(documentDigits);
      if (owner && owner.userId !== userId)
        throw new DuplicateEntityError(ErrorCode.DOCUMENT_ALREADY_IN_USE);
    }

    person.update(fields, this.now());
    await this.repository.update(person);
    return person;
  }
}
