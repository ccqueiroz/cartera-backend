import { Person } from '@/features/person/domain/person.entity';
import { PersonRepository } from '@/features/person/domain/ports/person.repository.port';

interface FindPersonByUserIdIncludingDeletedInput {
  userId: string;
}

/**
 * Exceção explícita ao filtro `deletedAt == null` — permite ao futuro auth
 * discriminar ACCOUNT_DELETED de USER_DISABLED (D5).
 */
export class FindPersonByUserIdIncludingDeletedUseCase {
  private constructor(private readonly repository: PersonRepository) {}

  public static create(
    repository: PersonRepository,
  ): FindPersonByUserIdIncludingDeletedUseCase {
    return new FindPersonByUserIdIncludingDeletedUseCase(repository);
  }

  public async execute(
    input: FindPersonByUserIdIncludingDeletedInput,
  ): Promise<Person | null> {
    return this.repository.findByUserIdIncludingDeleted(input.userId);
  }
}
