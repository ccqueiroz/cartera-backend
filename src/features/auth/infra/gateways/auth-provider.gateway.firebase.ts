import { Auth } from 'firebase-admin/auth';
import {
  signInUrl,
  refreshTokenUrl,
  ResetPasswordUrl,
} from '@/packages/clients/firebase/urlToAuthFirebase';
import { translateFirebaseError } from '@/packages/clients/firebase/firebase-error.translator';
import {
  DuplicateEntityError,
  ForbiddenError,
  UnauthorizedError,
  ErrorParams,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import {
  AuthProviderGateway,
  AuthSession,
  CreatedAuthAccount,
  RefreshedAuthSession,
  VerifiedAccessToken,
} from '@/features/auth/domain/ports/auth-provider.gateway';
import {
  SessionUser,
  SessionVerifierGateway,
} from '@/shared/http/express/middlewares/verify-token.middleware';

type FetchLike = (
  url: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body: string;
  },
) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

// Anti-enumeração: e-mail inexistente e senha errada são indistinguíveis (UC-02).
const SIGN_IN_MISS_CODES = new Set([
  'EMAIL_NOT_FOUND',
  'INVALID_PASSWORD',
  'INVALID_LOGIN_CREDENTIALS',
]);

function adminErrorCode(error: unknown): string {
  if (typeof error !== 'object' || error === null) return '';
  const code = (error as Record<string, unknown>)['code'];
  return typeof code === 'string' ? code : '';
}

function restErrorCode(payload: unknown): string {
  if (typeof payload !== 'object' || payload === null) return '';
  const error = (payload as Record<string, unknown>)['error'];
  if (typeof error !== 'object' || error === null) return '';
  const message = (error as Record<string, unknown>)['message'];
  // REST pode sufixar a mensagem ("TOO_MANY_ATTEMPTS_TRY_LATER : ...") — só o primeiro token discrimina.
  return typeof message === 'string' ? message.split(/[\s:]/)[0] : '';
}

export class AuthProviderGatewayFirebase
  implements AuthProviderGateway, SessionVerifierGateway
{
  private constructor(
    private readonly auth: Auth,
    private readonly fetchLike: FetchLike,
    private readonly now: () => Date,
  ) {}

  public static create(
    auth: Auth,
    fetchLike: FetchLike = fetch,
    now: () => Date = () => new Date(),
  ): AuthProviderGatewayFirebase {
    return new AuthProviderGatewayFirebase(auth, fetchLike, now);
  }

  public async createAccount(input: {
    email: string;
    password: string;
  }): Promise<CreatedAuthAccount> {
    try {
      const record = await this.auth.createUser({
        email: input.email,
        password: input.password,
      });
      return { userId: record.uid };
    } catch (error) {
      if (adminErrorCode(error) === 'auth/email-already-exists') {
        throw new DuplicateEntityError(ErrorCode.EMAIL_ALREADY_IN_USE);
      }
      translateFirebaseError(error);
    }
  }

  public async signInWithPassword(input: {
    email: string;
    password: string;
  }): Promise<AuthSession> {
    const response = await this.fetchLike(signInUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        returnSecureToken: true,
      }),
    });
    const payload = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      const code = restErrorCode(payload);
      if (code === 'USER_DISABLED') {
        throw new ForbiddenError(
          ErrorCode.USER_DISABLED,
          await this.userIdParamsFor(input.email),
        );
      }
      if (SIGN_IN_MISS_CODES.has(code)) {
        throw new UnauthorizedError(ErrorCode.INVALID_CREDENTIALS);
      }
      translateFirebaseError({ message: code });
    }

    return {
      userId: String(payload['localId']),
      email: String(payload['email'] ?? input.email),
      accessToken: String(payload['idToken']),
      refreshToken: String(payload['refreshToken']),
      expirationTime: this.expirationTimeFrom(String(payload['expiresIn'])),
    };
  }

  public async refreshSession(input: {
    refreshToken: string;
  }): Promise<RefreshedAuthSession> {
    const response = await this.fetchLike(refreshTokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: input.refreshToken,
      }).toString(),
    });
    const payload = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      translateFirebaseError({ message: restErrorCode(payload) });
    }

    return {
      userId: String(payload['user_id']),
      accessToken: String(payload['id_token']),
      refreshToken: String(payload['refresh_token']),
      expirationTime: this.expirationTimeFrom(String(payload['expires_in'])),
    };
  }

  public async revokeRefreshTokens(userId: string): Promise<void> {
    try {
      await this.auth.revokeRefreshTokens(userId);
    } catch (error) {
      translateFirebaseError(error);
    }
  }

  public async deleteAccount(userId: string): Promise<void> {
    try {
      await this.auth.deleteUser(userId);
    } catch (error) {
      translateFirebaseError(error);
    }
  }

  public async sendPasswordResetEmail(email: string): Promise<void> {
    const response = await this.fetchLike(ResetPasswordUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
    });
    if (!response.ok) {
      const payload = await response.json();
      translateFirebaseError({ message: restErrorCode(payload) });
    }
  }

  public async verifyAccessToken(
    accessToken: string,
  ): Promise<VerifiedAccessToken> {
    try {
      const decoded = await this.auth.verifyIdToken(accessToken, true);
      return { userId: decoded.uid, email: decoded.email ?? '' };
    } catch (error) {
      const code = adminErrorCode(error);
      // Expirado sinaliza refresh silencioso; revogado/malformado exige relogin (UC-05).
      if (code === 'auth/id-token-expired') {
        throw new UnauthorizedError(ErrorCode.TOKEN_EXPIRED);
      }
      if (code === 'auth/user-disabled') {
        throw new ForbiddenError(ErrorCode.USER_DISABLED);
      }
      throw new UnauthorizedError(ErrorCode.INVALID_TOKEN);
    }
  }

  public async verifyToken(input: {
    accessToken: string;
  }): Promise<SessionUser> {
    return this.verifyAccessToken(input.accessToken);
  }

  /**
   * Caminho frio do USER_DISABLED: o erro REST de signIn não carrega o uid,
   * e o login precisa dele pra discriminar ACCOUNT_DELETED vs USER_DISABLED.
   */
  private async userIdParamsFor(
    email: string,
  ): Promise<ErrorParams | undefined> {
    try {
      const user = await this.auth.getUserByEmail(email);
      return { userId: user.uid };
    } catch {
      return undefined;
    }
  }

  private expirationTimeFrom(expiresInSeconds: string): string {
    return new Date(
      this.now().getTime() + Number(expiresInSeconds) * 1000,
    ).toISOString();
  }
}
