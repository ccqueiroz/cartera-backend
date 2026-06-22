import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { request } from './support/http-client';
import { recordUser } from './support/manifest';

describe('auth (e2e-live)', () => {
  it('register → login → refresh → signout; 401 after signout', async () => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const email = `e2e+${unique}@cartera-e2e.test`;
    const password = 'e2e-Passw0rd!';

    const registration = await request('post', 'auth/account', {
      body: { email, password, firstName: 'E2E', lastName: 'Auth' },
    });
    expect(registration.status).toBe(201);

    const login = await request('post', 'auth/session', {
      body: { email, password },
    });
    expect(login.status).toBe(200);
    const loginBody = login.body as Record<string, unknown>;
    expect(typeof loginBody.accessToken).toBe('string');
    recordUser(String(loginBody.userId), String(loginBody.userId));

    const refresh = await request('put', 'auth/session', {
      body: { refreshToken: String(loginBody.refreshToken) },
    });
    expect(refresh.status).toBe(200);
    const token = String((refresh.body as Record<string, unknown>).accessToken);
    expect(token).not.toBe('undefined');

    const signout = await request('delete', 'auth/session', { token });
    expect(signout.status).toBe(204);

    const afterSignout = await request('get', 'person/me', { token });
    expect(afterSignout.status).toBe(401);
    expect((afterSignout.body as Record<string, unknown>).code).toBe(
      ErrorCode.INVALID_TOKEN,
    );
  });
});
