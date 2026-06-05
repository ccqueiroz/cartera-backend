import { AuthProviderGatewayFirebase } from './auth-provider.gateway.firebase';
import {
  DomainError,
  DuplicateEntityError,
  ForbiddenError,
  UnauthorizedError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const FIXED_NOW = new Date('2026-06-05T12:00:00.000Z');

const jsonResponse = (ok: boolean, payload: unknown) => ({
  ok,
  json: async () => payload,
});

const makeAuth = (overrides: Record<string, unknown> = {}) =>
  ({
    createUser: jest.fn(),
    revokeRefreshTokens: jest.fn(),
    deleteUser: jest.fn(),
    verifyIdToken: jest.fn(),
    getUserByEmail: jest.fn(),
    ...overrides,
  } as any);

const makeGateway = (auth: any, fetchLike: any) =>
  AuthProviderGatewayFirebase.create(auth, fetchLike, () => FIXED_NOW);

const catchError = async (promise: Promise<unknown>): Promise<DomainError> => {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(DomainError);
    return error as DomainError;
  }
  throw new Error('era pra ter lançado');
};

describe('AuthProviderGatewayFirebase', () => {
  describe('signInWithPassword', () => {
    const successPayload = {
      localId: 'uid-1',
      email: 'a@b.com',
      idToken: 'id-token',
      refreshToken: 'refresh-token',
      expiresIn: '3600',
    };

    it('normaliza expiresIn (segundos) para expirationTime ISO-8601 absoluto', async () => {
      const fetchLike = jest.fn(async () => jsonResponse(true, successPayload));
      const session = await makeGateway(
        makeAuth(),
        fetchLike,
      ).signInWithPassword({ email: 'a@b.com', password: 'secret' });

      expect(session.expirationTime).toBe('2026-06-05T13:00:00.000Z');
      expect(session).toEqual({
        userId: 'uid-1',
        email: 'a@b.com',
        accessToken: 'id-token',
        refreshToken: 'refresh-token',
        expirationTime: '2026-06-05T13:00:00.000Z',
      });
    });

    it.each([
      'EMAIL_NOT_FOUND',
      'INVALID_PASSWORD',
      'INVALID_LOGIN_CREDENTIALS',
    ])(
      'miss de credencial %s vira UnauthorizedError(INVALID_CREDENTIALS) — anti-enumeração',
      async (raw) => {
        const fetchLike = jest.fn(async () =>
          jsonResponse(false, { error: { message: raw } }),
        );
        const error = await catchError(
          makeGateway(makeAuth(), fetchLike).signInWithPassword({
            email: 'a@b.com',
            password: 'wrong',
          }),
        );
        expect(error).toBeInstanceOf(UnauthorizedError);
        expect(error.code).toBe(ErrorCode.INVALID_CREDENTIALS);
      },
    );

    it('USER_DISABLED resolve o uid via getUserByEmail no caminho frio', async () => {
      const auth = makeAuth({
        getUserByEmail: jest.fn(async () => ({ uid: 'uid-disabled' })),
      });
      const fetchLike = jest.fn(async () =>
        jsonResponse(false, { error: { message: 'USER_DISABLED' } }),
      );
      const error = await catchError(
        makeGateway(auth, fetchLike).signInWithPassword({
          email: 'a@b.com',
          password: 'secret',
        }),
      );
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.code).toBe(ErrorCode.USER_DISABLED);
      expect(error.params).toEqual({ userId: 'uid-disabled' });
      expect(auth.getUserByEmail).toHaveBeenCalledWith('a@b.com');
    });

    it('USER_DISABLED sem uid resolvível ainda lança ForbiddenError(USER_DISABLED)', async () => {
      const auth = makeAuth({
        getUserByEmail: jest.fn(async () => {
          throw new Error('lookup falhou');
        }),
      });
      const fetchLike = jest.fn(async () =>
        jsonResponse(false, { error: { message: 'USER_DISABLED' } }),
      );
      const error = await catchError(
        makeGateway(auth, fetchLike).signInWithPassword({
          email: 'a@b.com',
          password: 'secret',
        }),
      );
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.code).toBe(ErrorCode.USER_DISABLED);
      expect(error.params).toBeUndefined();
    });

    it('mensagem com sufixo ("TOO_MANY_ATTEMPTS_TRY_LATER : ...") discrimina pelo primeiro token', async () => {
      const fetchLike = jest.fn(async () =>
        jsonResponse(false, {
          error: { message: 'TOO_MANY_ATTEMPTS_TRY_LATER : Try again later.' },
        }),
      );
      const error = await catchError(
        makeGateway(makeAuth(), fetchLike).signInWithPassword({
          email: 'a@b.com',
          password: 'secret',
        }),
      );
      expect(error.code).toBe(ErrorCode.TOO_MANY_REQUESTS);
    });
  });

  describe('refreshSession', () => {
    it('normaliza payload snake_case e expires_in para ISO-8601', async () => {
      const fetchLike = jest.fn(async () =>
        jsonResponse(true, {
          user_id: 'uid-1',
          id_token: 'new-id-token',
          refresh_token: 'new-refresh-token',
          expires_in: '3600',
        }),
      );
      const session = await makeGateway(makeAuth(), fetchLike).refreshSession({
        refreshToken: 'old-refresh',
      });

      expect(session).toEqual({
        userId: 'uid-1',
        accessToken: 'new-id-token',
        refreshToken: 'new-refresh-token',
        expirationTime: '2026-06-05T13:00:00.000Z',
      });
    });

    it('envia o refresh token como form-urlencoded no secure-token', async () => {
      const fetchLike = jest.fn(async () =>
        jsonResponse(true, {
          user_id: 'u',
          id_token: 'i',
          refresh_token: 'r',
          expires_in: '60',
        }),
      );
      await makeGateway(makeAuth(), fetchLike).refreshSession({
        refreshToken: 'the-token',
      });

      const [, init] = fetchLike.mock.calls[0] as any[];
      expect(init.headers['Content-Type']).toBe(
        'application/x-www-form-urlencoded',
      );
      expect(init.body).toContain('grant_type=refresh_token');
      expect(init.body).toContain('refresh_token=the-token');
    });

    it.each(['TOKEN_EXPIRED', 'INVALID_REFRESH_TOKEN'])(
      'refresh inválido/expirado (%s) vira INVALID_TOKEN (relogin)',
      async (raw) => {
        const fetchLike = jest.fn(async () =>
          jsonResponse(false, { error: { message: raw } }),
        );
        const error = await catchError(
          makeGateway(makeAuth(), fetchLike).refreshSession({
            refreshToken: 'revogado',
          }),
        );
        expect(error.code).toBe(ErrorCode.INVALID_TOKEN);
      },
    );
  });

  describe('createAccount', () => {
    it('devolve o uid criado', async () => {
      const auth = makeAuth({
        createUser: jest.fn(async () => ({ uid: 'uid-novo' })),
      });
      const account = await makeGateway(auth, jest.fn()).createAccount({
        email: 'a@b.com',
        password: 'secret',
      });
      expect(account).toEqual({ userId: 'uid-novo' });
    });

    it('e-mail duplicado vira DuplicateEntityError(EMAIL_ALREADY_IN_USE) — 409', async () => {
      const auth = makeAuth({
        createUser: jest.fn(async () => {
          throw { code: 'auth/email-already-exists' };
        }),
      });
      const error = await catchError(
        makeGateway(auth, jest.fn()).createAccount({
          email: 'a@b.com',
          password: 'secret',
        }),
      );
      expect(error).toBeInstanceOf(DuplicateEntityError);
      expect(error.code).toBe(ErrorCode.EMAIL_ALREADY_IN_USE);
    });

    it('outros erros do Admin passam pela ACL', async () => {
      const auth = makeAuth({
        createUser: jest.fn(async () => {
          throw { code: 'auth/invalid-email' };
        }),
      });
      const error = await catchError(
        makeGateway(auth, jest.fn()).createAccount({
          email: 'ruim',
          password: 'secret',
        }),
      );
      expect(error.code).toBe(ErrorCode.INVALID_EMAIL);
    });
  });

  describe('verifyAccessToken', () => {
    it('verifica com checkRevoked e devolve userId/email', async () => {
      const auth = makeAuth({
        verifyIdToken: jest.fn(async () => ({
          uid: 'uid-1',
          email: 'a@b.com',
        })),
      });
      const verified = await makeGateway(auth, jest.fn()).verifyAccessToken(
        'token',
      );
      expect(verified).toEqual({ userId: 'uid-1', email: 'a@b.com' });
      expect(auth.verifyIdToken).toHaveBeenCalledWith('token', true);
    });

    it('token expirado vira TOKEN_EXPIRED (sinal de refresh silencioso)', async () => {
      const auth = makeAuth({
        verifyIdToken: jest.fn(async () => {
          throw { code: 'auth/id-token-expired' };
        }),
      });
      const error = await catchError(
        makeGateway(auth, jest.fn()).verifyAccessToken('expirado'),
      );
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.code).toBe(ErrorCode.TOKEN_EXPIRED);
    });

    it('token revogado vira INVALID_TOKEN (relogin)', async () => {
      const auth = makeAuth({
        verifyIdToken: jest.fn(async () => {
          throw { code: 'auth/id-token-revoked' };
        }),
      });
      const error = await catchError(
        makeGateway(auth, jest.fn()).verifyAccessToken('revogado'),
      );
      expect(error.code).toBe(ErrorCode.INVALID_TOKEN);
    });

    it('conta desativada vira ForbiddenError(USER_DISABLED) — 403, não 401', async () => {
      const auth = makeAuth({
        verifyIdToken: jest.fn(async () => {
          throw { code: 'auth/user-disabled' };
        }),
      });
      const error = await catchError(
        makeGateway(auth, jest.fn()).verifyAccessToken('token'),
      );
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.code).toBe(ErrorCode.USER_DISABLED);
    });

    it('token malformado/erro desconhecido vira INVALID_TOKEN', async () => {
      const auth = makeAuth({
        verifyIdToken: jest.fn(async () => {
          throw new Error('malformado');
        }),
      });
      const error = await catchError(
        makeGateway(auth, jest.fn()).verifyAccessToken('lixo'),
      );
      expect(error.code).toBe(ErrorCode.INVALID_TOKEN);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('sucesso não lança', async () => {
      const fetchLike = jest.fn(async () => jsonResponse(true, {}));
      await expect(
        makeGateway(makeAuth(), fetchLike).sendPasswordResetEmail('a@b.com'),
      ).resolves.toBeUndefined();
    });

    it('EMAIL_NOT_FOUND atravessa traduzido (quem engole é o use case)', async () => {
      const fetchLike = jest.fn(async () =>
        jsonResponse(false, { error: { message: 'EMAIL_NOT_FOUND' } }),
      );
      const error = await catchError(
        makeGateway(makeAuth(), fetchLike).sendPasswordResetEmail(
          'ninguem@b.com',
        ),
      );
      expect(error.code).toBe(ErrorCode.EMAIL_NOT_FOUND);
    });
  });

  describe('revokeRefreshTokens / deleteAccount', () => {
    it('revoga via Admin SDK', async () => {
      const auth = makeAuth();
      await makeGateway(auth, jest.fn()).revokeRefreshTokens('uid-1');
      expect(auth.revokeRefreshTokens).toHaveBeenCalledWith('uid-1');
    });

    it('deleta via Admin SDK', async () => {
      const auth = makeAuth();
      await makeGateway(auth, jest.fn()).deleteAccount('uid-1');
      expect(auth.deleteUser).toHaveBeenCalledWith('uid-1');
    });

    it('erros do Admin passam pela ACL', async () => {
      const auth = makeAuth({
        deleteUser: jest.fn(async () => {
          throw { code: 'auth/user-not-found' };
        }),
      });
      const error = await catchError(
        makeGateway(auth, jest.fn()).deleteAccount('uid-x'),
      );
      expect(error.code).toBe(ErrorCode.ACCOUNT_NOT_FOUND);
    });
  });
});
