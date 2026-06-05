import { Auth } from 'firebase-admin/auth';
import { AuthGateway } from '@/features/person/domain/ports/auth.gateway.port';

export class AuthGatewayFirebase implements AuthGateway {
  private constructor(private readonly auth: Auth) {}

  public static create(auth: Auth): AuthGatewayFirebase {
    return new AuthGatewayFirebase(auth);
  }

  public async disableAccount(userId: string): Promise<void> {
    await this.auth.updateUser(userId, { disabled: true });
  }

  public async revokeRefreshTokens(userId: string): Promise<void> {
    await this.auth.revokeRefreshTokens(userId);
  }
}
