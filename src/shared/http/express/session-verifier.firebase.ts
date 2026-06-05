import { Auth, DecodedIdToken } from 'firebase-admin/auth';
import {
  SessionUser,
  SessionVerifierGateway,
} from '@/shared/http/express/middlewares/verify-token.middleware';

/**
 * Aceita session cookie (fluxo padrão) e idToken (fallback), sempre com
 * checkRevoked — revogação de refresh tokens derruba a sessão na hora.
 */
export class SessionVerifierFirebase implements SessionVerifierGateway {
  private constructor(private readonly auth: Auth) {}

  public static create(auth: Auth): SessionVerifierFirebase {
    return new SessionVerifierFirebase(auth);
  }

  public async verifyToken(input: {
    accessToken: string;
  }): Promise<SessionUser | null> {
    const decoded = await this.decode(input.accessToken);
    if (!decoded) return null;
    return {
      userId: decoded.uid,
      email: decoded.email ?? '',
      expirationTime: decoded.exp,
    };
  }

  private async decode(token: string): Promise<DecodedIdToken | null> {
    try {
      return await this.auth.verifySessionCookie(token, true);
    } catch {
      try {
        return await this.auth.verifyIdToken(token, true);
      } catch {
        return null;
      }
    }
  }
}
