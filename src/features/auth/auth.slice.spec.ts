import type { Request, Response } from 'express';
import { makeAuthModule } from '@/features/auth/auth.factory';
import { Route } from '@/shared/http/route';
import { VerifyTokenMiddleware } from '@/shared/http/express/middlewares/verify-token.middleware';
import { ErrorMiddleware } from '@/shared/http/express/middlewares/error.middleware';
import {
  DuplicateEntityError,
  ForbiddenError,
  UnauthorizedError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { LoggerGateway } from '@/shared/logger/logger.gateway';

const SESSION_COOKIE_ATTRIBUTES = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
};

const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

interface FakeAccount {
  userId: string;
  email: string;
  password: string;
  disabled: boolean;
}

/**
 * Fake in-memory do provider implementando AuthProviderGateway +
 * SessionVerifierGateway com a MESMA semântica de erros do adapter Firebase
 * (contrato do adapter coberto por unit em auth-provider.gateway.firebase.spec).
 */
class FakeAuthProvider {
  public accounts = new Map<string, FakeAccount>();
  public issuedAccessTokens = new Set<string>();
  public issuedRefreshTokens = new Set<string>();
  private sequence = 0;

  public async createAccount(input: { email: string; password: string }) {
    if (this.findByEmail(input.email)) {
      throw new DuplicateEntityError(ErrorCode.EMAIL_ALREADY_IN_USE);
    }
    const userId = `uid-${++this.sequence}`;
    this.accounts.set(userId, {
      userId,
      email: input.email,
      password: input.password,
      disabled: false,
    });
    return { userId };
  }

  public async signInWithPassword(input: { email: string; password: string }) {
    const account = this.findByEmail(input.email);
    if (!account || account.password !== input.password) {
      throw new UnauthorizedError(ErrorCode.INVALID_CREDENTIALS);
    }
    if (account.disabled) {
      throw new ForbiddenError(ErrorCode.USER_DISABLED, {
        userId: account.userId,
      });
    }
    return { email: account.email, ...this.issueSession(account.userId) };
  }

  public async refreshSession(input: { refreshToken: string }) {
    const userId = this.userIdOfRefreshToken(input.refreshToken);
    if (!userId || !this.issuedRefreshTokens.has(input.refreshToken)) {
      throw new UnauthorizedError(ErrorCode.INVALID_TOKEN);
    }
    return this.issueSession(userId);
  }

  public async revokeRefreshTokens(userId: string) {
    for (const token of this.issuedRefreshTokens) {
      if (this.userIdOfRefreshToken(token) === userId) {
        this.issuedRefreshTokens.delete(token);
      }
    }
    for (const token of this.issuedAccessTokens) {
      if (token.startsWith(`access:${userId}:`)) {
        this.issuedAccessTokens.delete(token);
      }
    }
  }

  public async deleteAccount(userId: string) {
    this.accounts.delete(userId);
  }

  public async sendPasswordResetEmail(email: string) {
    if (!this.findByEmail(email)) {
      throw new UnauthorizedError(ErrorCode.EMAIL_NOT_FOUND);
    }
  }

  public async verifyToken(input: { accessToken: string }) {
    if (input.accessToken.startsWith('expired:')) {
      throw new UnauthorizedError(ErrorCode.TOKEN_EXPIRED);
    }
    if (!this.issuedAccessTokens.has(input.accessToken)) {
      throw new UnauthorizedError(ErrorCode.INVALID_TOKEN);
    }
    const userId = input.accessToken.split(':')[1];
    const account = this.accounts.get(userId);
    if (!account) throw new UnauthorizedError(ErrorCode.INVALID_TOKEN);
    if (account.disabled) {
      throw new ForbiddenError(ErrorCode.USER_DISABLED);
    }
    return { userId: account.userId, email: account.email };
  }

  private findByEmail(email: string): FakeAccount | undefined {
    return [...this.accounts.values()].find(
      (account) => account.email === email,
    );
  }

  private issueSession(userId: string) {
    const accessToken = `access:${userId}:${++this.sequence}`;
    const refreshToken = `refresh:${userId}:${this.sequence}`;
    this.issuedAccessTokens.add(accessToken);
    this.issuedRefreshTokens.add(refreshToken);
    return {
      userId,
      accessToken,
      refreshToken,
      expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }

  private userIdOfRefreshToken(token: string): string | undefined {
    return token.startsWith('refresh:') ? token.split(':')[1] : undefined;
  }
}

class FakePersonGateway {
  public persons = new Map<string, { id: string; deletedAt: string | null }>();
  public failNextCreate = false;
  private sequence = 0;

  public async create(input: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  }) {
    if (this.failNextCreate) {
      this.failNextCreate = false;
      throw new Error('person indisponível');
    }
    const id = `person-${++this.sequence}`;
    this.persons.set(input.userId, { id, deletedAt: null });
    return {
      id,
      firstName: input.firstName,
      lastName: input.lastName,
      createdAt: '2026-06-05T12:00:00.000Z',
      updatedAt: null,
    };
  }

  public async findByUserIdIncludingDeleted(userId: string) {
    const person = this.persons.get(userId);
    return person ? { deletedAt: person.deletedAt } : null;
  }
}

interface DispatchedResponse {
  statusCode: number;
  body: unknown;
  cookies: Record<string, { value: string; options: unknown }>;
  clearedCookies: Record<string, unknown>;
}

function makeHarness() {
  const provider = new FakeAuthProvider();
  const personGateway = new FakePersonGateway();
  const authMiddleware = VerifyTokenMiddleware.create(provider);
  const routes = makeAuthModule({
    authMiddleware,
    authProviderGateway: provider as any,
    personGateway: personGateway as any,
  });
  const logger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as unknown as LoggerGateway;
  const errorMiddleware = ErrorMiddleware.create(logger);

  const routeOf = (method: string, path: string): Route => {
    const route = routes.find(
      (candidate) => candidate.method === method && candidate.path === path,
    );
    if (!route) throw new Error(`rota ${method} ${path} não registrada`);
    return route;
  };

  const dispatch = async (
    method: string,
    path: string,
    input: {
      body?: unknown;
      authorization?: string;
      sessionCookie?: string;
    } = {},
  ): Promise<DispatchedResponse> => {
    const route = routeOf(method, path);
    const result: DispatchedResponse = {
      statusCode: 0,
      body: undefined,
      cookies: {},
      clearedCookies: {},
    };
    const response = {
      status(code: number) {
        result.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        result.body = payload;
        return this;
      },
      send() {
        return this;
      },
      cookie(name: string, value: string, options: unknown) {
        result.cookies[name] = { value, options };
        return this;
      },
      clearCookie(name: string, options: unknown) {
        result.clearedCookies[name] = options;
        return this;
      },
    } as unknown as Response;
    const request = {
      body: input.body ?? {},
      headers: { authorization: input.authorization },
      cookies: input.sessionCookie ? { session: input.sessionCookie } : {},
    } as unknown as Request;

    try {
      for (const middleware of route.middlewares ?? []) {
        let middlewareError: Error | undefined;
        await middleware.getHandler()(request, response, ((error?: Error) => {
          middlewareError = error;
        }) as any);
        if (middlewareError) throw middlewareError;
      }
      await route.handler(request, response, jest.fn());
    } catch (error) {
      errorMiddleware.getHandler()(
        error as Error,
        request,
        response,
        jest.fn(),
      );
    }
    return result;
  };

  return { provider, personGateway, dispatch };
}

const REGISTER_BODY = {
  email: 'ana@example.com',
  password: 'secret6',
  firstName: 'Ana',
  lastName: 'Souza',
};

describe('auth e2e (slice via factory + deps fake)', () => {
  describe('7.1 registro', () => {
    it('registro feliz: 201, shape do body e cookie com atributos', async () => {
      const { dispatch } = makeHarness();
      const response = await dispatch('post', 'auth/account', {
        body: REGISTER_BODY,
      });

      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({
        email: 'ana@example.com',
        userId: 'uid-1',
        firstName: 'Ana',
        lastName: 'Souza',
        fullName: 'Ana Souza',
        id: 'person-1',
        updatedAt: null,
      });
      const body = response.body as Record<string, string>;
      expect(body.accessToken).toBeTruthy();
      expect(body.refreshToken).toBeTruthy();
      expect(body.expirationTime).toMatch(ISO_8601);
      expect(response.cookies['session']).toEqual({
        value: body.accessToken,
        options: SESSION_COOKIE_ATTRIBUTES,
      });
    });

    it('e-mail duplicado: 409 EMAIL_ALREADY_IN_USE', async () => {
      const { dispatch } = makeHarness();
      await dispatch('post', 'auth/account', { body: REGISTER_BODY });
      const response = await dispatch('post', 'auth/account', {
        body: REGISTER_BODY,
      });

      expect(response.statusCode).toBe(409);
      expect(response.body).toMatchObject({
        code: ErrorCode.EMAIL_ALREADY_IN_USE,
      });
    });

    it('falha do person compensa: nenhuma conta órfã sobra no provider', async () => {
      const { dispatch, provider, personGateway } = makeHarness();
      personGateway.failNextCreate = true;

      const response = await dispatch('post', 'auth/account', {
        body: REGISTER_BODY,
      });

      expect(response.statusCode).toBe(500);
      expect(provider.accounts.size).toBe(0);
    });
  });

  describe('7.2 login', () => {
    it('login feliz: 200 com tokens no body e cookie setado', async () => {
      const { dispatch } = makeHarness();
      await dispatch('post', 'auth/account', { body: REGISTER_BODY });

      const response = await dispatch('post', 'auth/session', {
        body: { email: 'ana@example.com', password: 'secret6' },
      });

      expect(response.statusCode).toBe(200);
      const body = response.body as Record<string, string>;
      expect(body.userId).toBe('uid-1');
      expect(body.expirationTime).toMatch(ISO_8601);
      expect(response.cookies['session']).toEqual({
        value: body.accessToken,
        options: SESSION_COOKIE_ATTRIBUTES,
      });
    });

    it('e-mail inexistente e senha errada são 401 INVALID_CREDENTIALS indistinguíveis', async () => {
      const { dispatch } = makeHarness();
      await dispatch('post', 'auth/account', { body: REGISTER_BODY });

      const wrongEmail = await dispatch('post', 'auth/session', {
        body: { email: 'ninguem@example.com', password: 'secret6' },
      });
      const wrongPassword = await dispatch('post', 'auth/session', {
        body: { email: 'ana@example.com', password: 'errada6' },
      });

      expect(wrongEmail.statusCode).toBe(401);
      expect(wrongPassword.statusCode).toBe(401);
      expect(wrongEmail.body).toEqual(wrongPassword.body);
      expect(wrongEmail.body).toMatchObject({
        code: ErrorCode.INVALID_CREDENTIALS,
      });
    });

    it('conta desativada com person soft-deletado: 403 ACCOUNT_DELETED', async () => {
      const { dispatch, provider, personGateway } = makeHarness();
      await dispatch('post', 'auth/account', { body: REGISTER_BODY });
      provider.accounts.get('uid-1')!.disabled = true;
      personGateway.persons.get('uid-1')!.deletedAt =
        '2026-06-04T00:00:00.000Z';

      const response = await dispatch('post', 'auth/session', {
        body: { email: 'ana@example.com', password: 'secret6' },
      });

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({ code: ErrorCode.ACCOUNT_DELETED });
    });

    it('conta desativada sem soft-delete: 403 USER_DISABLED', async () => {
      const { dispatch, provider } = makeHarness();
      await dispatch('post', 'auth/account', { body: REGISTER_BODY });
      provider.accounts.get('uid-1')!.disabled = true;

      const response = await dispatch('post', 'auth/session', {
        body: { email: 'ana@example.com', password: 'secret6' },
      });

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({ code: ErrorCode.USER_DISABLED });
    });
  });

  describe('7.3 refresh', () => {
    it('refresh feliz: 200 com tokens novos e expirationTime no MESMO formato do login', async () => {
      const { dispatch } = makeHarness();
      const registered = await dispatch('post', 'auth/account', {
        body: REGISTER_BODY,
      });
      const registerBody = registered.body as Record<string, string>;

      const response = await dispatch('put', 'auth/session', {
        body: { refreshToken: registerBody.refreshToken },
      });

      expect(response.statusCode).toBe(200);
      const body = response.body as Record<string, string>;
      expect(body.accessToken).not.toBe(registerBody.accessToken);
      expect(body.expirationTime).toMatch(ISO_8601);
      expect(registerBody.expirationTime).toMatch(ISO_8601);
      expect(response.cookies['session']).toEqual({
        value: body.accessToken,
        options: SESSION_COOKIE_ATTRIBUTES,
      });
    });

    it('refresh sem token: 400 VALIDATION_FAILED', async () => {
      const { dispatch } = makeHarness();
      const response = await dispatch('put', 'auth/session', { body: {} });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        code: ErrorCode.VALIDATION_FAILED,
      });
    });

    it('refresh revogado (pós-signout): 401 INVALID_TOKEN', async () => {
      const { dispatch } = makeHarness();
      const registered = await dispatch('post', 'auth/account', {
        body: REGISTER_BODY,
      });
      const registerBody = registered.body as Record<string, string>;
      await dispatch('delete', 'auth/session', {
        authorization: `Bearer ${registerBody.accessToken}`,
      });

      const response = await dispatch('put', 'auth/session', {
        body: { refreshToken: registerBody.refreshToken },
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({ code: ErrorCode.INVALID_TOKEN });
    });
  });

  describe('7.4 signout e guarda de rota', () => {
    it('signout: 204, cookie expirado e request guardada subsequente 401', async () => {
      const { dispatch } = makeHarness();
      const registered = await dispatch('post', 'auth/account', {
        body: REGISTER_BODY,
      });
      const registerBody = registered.body as Record<string, string>;

      const signout = await dispatch('delete', 'auth/session', {
        authorization: `Bearer ${registerBody.accessToken}`,
      });
      expect(signout.statusCode).toBe(204);
      expect(signout.clearedCookies['session']).toEqual(
        SESSION_COOKIE_ATTRIBUTES,
      );

      const guardedAfter = await dispatch('delete', 'auth/session', {
        authorization: `Bearer ${registerBody.accessToken}`,
      });
      expect(guardedAfter.statusCode).toBe(401);
      expect(guardedAfter.body).toMatchObject({
        code: ErrorCode.INVALID_TOKEN,
      });
    });

    it('Bearer vence o cookie quando ambos presentes', async () => {
      const { dispatch } = makeHarness();
      const registered = await dispatch('post', 'auth/account', {
        body: REGISTER_BODY,
      });
      const registerBody = registered.body as Record<string, string>;

      const response = await dispatch('delete', 'auth/session', {
        authorization: `Bearer ${registerBody.accessToken}`,
        sessionCookie: 'token-invalido-no-cookie',
      });

      expect(response.statusCode).toBe(204);
    });

    it('cookie session funciona como fallback sem header', async () => {
      const { dispatch } = makeHarness();
      const registered = await dispatch('post', 'auth/account', {
        body: REGISTER_BODY,
      });
      const registerBody = registered.body as Record<string, string>;

      const response = await dispatch('delete', 'auth/session', {
        sessionCookie: registerBody.accessToken,
      });

      expect(response.statusCode).toBe(204);
    });

    it('token expirado: 401 TOKEN_EXPIRED (≠ INVALID_TOKEN)', async () => {
      const { dispatch } = makeHarness();
      const expired = await dispatch('delete', 'auth/session', {
        authorization: 'Bearer expired:uid-1:1',
      });
      const invalid = await dispatch('delete', 'auth/session', {
        authorization: 'Bearer token-desconhecido',
      });

      expect(expired.statusCode).toBe(401);
      expect(expired.body).toMatchObject({ code: ErrorCode.TOKEN_EXPIRED });
      expect(invalid.statusCode).toBe(401);
      expect(invalid.body).toMatchObject({ code: ErrorCode.INVALID_TOKEN });
    });

    it('sem credencial nenhuma: 401 INVALID_TOKEN', async () => {
      const { dispatch } = makeHarness();
      const response = await dispatch('delete', 'auth/session');

      expect(response.statusCode).toBe(401);
      expect(response.body).toMatchObject({ code: ErrorCode.INVALID_TOKEN });
    });

    it('conta desativada no meio da sessão: 403', async () => {
      const { dispatch, provider } = makeHarness();
      const registered = await dispatch('post', 'auth/account', {
        body: REGISTER_BODY,
      });
      const registerBody = registered.body as Record<string, string>;
      provider.accounts.get('uid-1')!.disabled = true;

      const response = await dispatch('delete', 'auth/session', {
        authorization: `Bearer ${registerBody.accessToken}`,
      });

      expect(response.statusCode).toBe(403);
      expect(response.body).toMatchObject({ code: ErrorCode.USER_DISABLED });
    });
  });

  describe('7.5 recuperação de senha', () => {
    it('e-mail existente e desconhecido: mesmo 202 com body idêntico', async () => {
      const { dispatch } = makeHarness();
      await dispatch('post', 'auth/account', { body: REGISTER_BODY });

      const existing = await dispatch('post', 'auth/password-recovery', {
        body: { email: 'ana@example.com' },
      });
      const unknown = await dispatch('post', 'auth/password-recovery', {
        body: { email: 'ninguem@example.com' },
      });

      expect(existing.statusCode).toBe(202);
      expect(unknown.statusCode).toBe(202);
      expect(existing.body).toEqual(unknown.body);
      expect(JSON.stringify(existing.body)).not.toContain('NOT_FOUND');
    });

    it('e-mail malformado: 400 INVALID_EMAIL', async () => {
      const { dispatch } = makeHarness();
      const response = await dispatch('post', 'auth/password-recovery', {
        body: { email: 'nao-eh-email' },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({ code: ErrorCode.INVALID_EMAIL });
    });
  });
});
