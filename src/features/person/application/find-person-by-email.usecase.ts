import { Person } from '@/features/person/domain/person.entity';
import { PersonRepository } from '@/features/person/domain/ports/person.repository.port';

interface FindPersonByEmailInput {
  email: string;
}

export class FindPersonByEmailUseCase {
  private constructor(private readonly repository: PersonRepository) {}

  public static create(repository: PersonRepository): FindPersonByEmailUseCase {
    return new FindPersonByEmailUseCase(repository);
  }

  public async execute(input: FindPersonByEmailInput): Promise<Person | null> {
    return this.repository.findByEmail(input.email);
  }
}
