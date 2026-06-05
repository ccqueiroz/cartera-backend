import { ForbiddenError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import {
  AuthProviderGateway,
  AuthSession,
} from '@/features/auth/domain/ports/auth-provider.gateway';
import { PersonGateway } from '@/features/auth/domain/ports/person.gateway';

interface LoginInput {
  email: string;
  password: string;
}

export class LoginUseCase {
  private constructor(
    private readonly authProvider: AuthProviderGateway,
    private readonly personGateway: PersonGateway,
  ) {}

  public static create(
    authProvider: AuthProviderGateway,
    personGateway: PersonGateway,
  ): LoginUseCase {
    return new LoginUseCase(authProvider, personGateway);
  }

  public async execute(input: LoginInput): Promise<AuthSession> {
    try {
      return await this.authProvider.signInWithPassword(input);
    } catch (error) {
      await this.discriminateDisabledAccount(error);
      throw error;
    }
  }

  /**
   * Caminho frio (só no erro de conta desativada): person soft-deletado
   * distingue o encerramento terminal (ACCOUNT_DELETED) da suspensão
   * (USER_DISABLED). Nenhum lookup no caminho feliz.
   */
  private async discriminateDisabledAccount(error: unknown): Promise<void> {
    if (
      !(error instanceof ForbiddenError) ||
      error.code !== ErrorCode.USER_DISABLED
    ) {
      return;
    }

    const userId = error.params?.userId;
    if (!userId) return;

    const person = await this.personGateway.findByUserIdIncludingDeleted(
      String(userId),
    );
    if (person?.deletedAt) {
      throw new ForbiddenError(ErrorCode.ACCOUNT_DELETED);
    }
  }
}
