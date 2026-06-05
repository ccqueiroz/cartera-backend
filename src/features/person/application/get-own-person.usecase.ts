import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { Person } from '@/features/person/domain/person.entity';
import { PersonRepository } from '@/features/person/domain/ports/person.repository.port';
import { AuthGateway } from '@/features/person/domain/ports/auth.gateway.port';

interface GetOwnPersonInput {
  userId: string;
}

export class GetOwnPersonUseCase {
  private constructor(
    private readonly repository: PersonRepository,
    private readonly authGateway: AuthGateway,
  ) {}

  public static create(
    repository: PersonRepository,
    authGateway: AuthGateway,
  ): GetOwnPersonUseCase {
    return new GetOwnPersonUseCase(repository, authGateway);
  }

  public async execute(input: GetOwnPersonInput): Promise<Person> {
    const person = await this.repository.findByUserId(input.userId);
    if (!person) {
      // Sessão órfã: token válido sem person ativo — revoga antes do 404.
      await this.authGateway.revokeRefreshTokens(input.userId);
      throw new EntityNotFoundError(ErrorCode.PERSON_NOT_FOUND);
    }
    return person;
  }
}
