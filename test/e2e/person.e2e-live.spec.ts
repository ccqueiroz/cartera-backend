import { request } from './support/http-client';
import { registerAndLogin, Session } from './support/register-and-login';

describe('person (e2e-live)', () => {
  let userA: Session;
  let userB: Session;

  beforeAll(async () => {
    userA = await registerAndLogin();
    userB = await registerAndLogin();
  });

  it('gets and updates own profile', async () => {
    const me = await request('get', 'person/me', { token: userA.token });
    expect(me.status).toBe(200);

    const updated = await request('patch', 'person/me', {
      token: userA.token,
      body: { firstName: 'Renamed' },
    });
    expect(updated.status).toBe(200);
    expect((updated.body as Record<string, unknown>).firstName).toBe('Renamed');

    const after = await request('get', 'person/me', { token: userA.token });
    expect((after.body as Record<string, unknown>).firstName).toBe('Renamed');
  });

  it('isolation: person/me returns only the requesting owner', async () => {
    const meB = await request('get', 'person/me', { token: userB.token });
    expect(meB.status).toBe(200);
    const body = meB.body as Record<string, unknown>;
    expect(body.email).toBe(userB.email);
    expect(body.email).not.toBe(userA.email);
  });

  it('soft-deletes own profile', async () => {
    const throwaway = await registerAndLogin();
    const deleted = await request('delete', 'person/me', {
      token: throwaway.token,
    });
    expect(deleted.status).toBe(204);
  });
});
