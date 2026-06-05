import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { PersonRepository } from '@/features/person/domain/ports/person.repository.port';
import { AuthGateway } from '@/features/person/domain/ports/auth.gateway.port';

interface DeleteOwnPersonInput {
  userId: string;
}

/**
 * Soft delete terminal disable-first (D3): disable → revoke → deletedAt.
 * Cada passo é idempotente; falha em qualquer ponto deixa estado seguro
 * "conta trancada com perfil vivo" e o retry forward completa a sequência.
 */
export class DeleteOwnPersonUseCase {
  private constructor(
    private readonly repository: PersonRepository,
    private readonly authGateway: AuthGateway,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: PersonRepository,
    authGateway: AuthGateway,
    now: () => string,
  ): DeleteOwnPersonUseCase {
    return new DeleteOwnPersonUseCase(repository, authGateway, now);
  }

  public async execute(input: DeleteOwnPersonInput): Promise<void> {
    const person = await this.repository.findByUserIdIncludingDeleted(
      input.userId,
    );
    if (!person) throw new EntityNotFoundError(ErrorCode.PERSON_NOT_FOUND);

    await this.authGateway.disableAccount(input.userId);
    await this.authGateway.revokeRefreshTokens(input.userId);

    person.softDelete(this.now());
    await this.repository.update(person);
  }
}
