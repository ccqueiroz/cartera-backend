import {
  AuthProviderGateway,
  RefreshedAuthSession,
} from '@/features/auth/domain/ports/auth-provider.gateway';

interface RefreshSessionInput {
  refreshToken: string;
}

export class RefreshSessionUseCase {
  private constructor(private readonly authProvider: AuthProviderGateway) {}

  public static create(
    authProvider: AuthProviderGateway,
  ): RefreshSessionUseCase {
    return new RefreshSessionUseCase(authProvider);
  }

  public async execute(
    input: RefreshSessionInput,
  ): Promise<RefreshedAuthSession> {
    return this.authProvider.refreshSession(input);
  }
}
