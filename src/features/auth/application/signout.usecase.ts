import { AuthProviderGateway } from '@/features/auth/domain/ports/auth-provider.gateway';

interface SignoutInput {
  userId: string;
}

export class SignoutUseCase {
  private constructor(private readonly authProvider: AuthProviderGateway) {}

  public static create(authProvider: AuthProviderGateway): SignoutUseCase {
    return new SignoutUseCase(authProvider);
  }

  public async execute(input: SignoutInput): Promise<void> {
    await this.authProvider.revokeRefreshTokens(input.userId);
  }
}
