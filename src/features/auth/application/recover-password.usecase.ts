import { DomainError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { AuthProviderGateway } from '@/features/auth/domain/ports/auth-provider.gateway';

interface RecoverPasswordInput {
  email: string;
}

// Anti-enumeração (UC-06): existência de conta nunca vaza — sempre 202 genérico.
const ACCOUNT_EXISTENCE_CODES = new Set<ErrorCode>([
  ErrorCode.EMAIL_NOT_FOUND,
  ErrorCode.USER_NOT_FOUND,
  ErrorCode.ACCOUNT_NOT_FOUND,
]);

export class RecoverPasswordUseCase {
  private constructor(private readonly authProvider: AuthProviderGateway) {}

  public static create(
    authProvider: AuthProviderGateway,
  ): RecoverPasswordUseCase {
    return new RecoverPasswordUseCase(authProvider);
  }

  public async execute(input: RecoverPasswordInput): Promise<void> {
    try {
      await this.authProvider.sendPasswordResetEmail(input.email);
    } catch (error) {
      if (
        error instanceof DomainError &&
        ACCOUNT_EXISTENCE_CODES.has(error.code)
      ) {
        return;
      }
      throw error;
    }
  }
}
