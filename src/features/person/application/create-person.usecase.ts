import { DuplicateEntityError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { Person } from '@/features/person/domain/person.entity';
import { PersonRepository } from '@/features/person/domain/ports/person.repository.port';

interface CreatePersonInput {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export class CreatePersonUseCase {
  private constructor(
    private readonly repository: PersonRepository,
    private readonly generateId: () => string,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: PersonRepository,
    generateId: () => string,
    now: () => string,
  ): CreatePersonUseCase {
    return new CreatePersonUseCase(repository, generateId, now);
  }

  public async execute(input: CreatePersonInput): Promise<Person> {
    // Inclui deletados: soft delete é terminal, o userId nunca volta a ficar livre.
    const existing = await this.repository.findByUserIdIncludingDeleted(
      input.userId,
    );
    if (existing)
      throw new DuplicateEntityError(ErrorCode.PERSON_ALREADY_EXISTS);

    const person = Person.create({
      id: this.generateId(),
      userId: input.userId,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      createdAt: this.now(),
    });
    await this.repository.create(person);
    return person;
  }
}
