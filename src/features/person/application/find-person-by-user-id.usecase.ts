import { Person } from '@/features/person/domain/person.entity';
import { PersonRepository } from '@/features/person/domain/ports/person.repository.port';

interface FindPersonByUserIdInput {
  userId: string;
}

export class FindPersonByUserIdUseCase {
  private constructor(private readonly repository: PersonRepository) {}

  public static create(
    repository: PersonRepository,
  ): FindPersonByUserIdUseCase {
    return new FindPersonByUserIdUseCase(repository);
  }

  public async execute(input: FindPersonByUserIdInput): Promise<Person | null> {
    return this.repository.findByUserId(input.userId);
  }
}
