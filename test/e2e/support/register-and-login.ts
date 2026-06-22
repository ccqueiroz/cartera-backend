import { delay, request } from './http-client';
import { recordUser } from './manifest';

export interface Session {
  token: string;
  userId: string;
  authUid: string;
  personId?: string;
  defaultWalletId?: string;
  email: string;
  password: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  return (value ?? {}) as Record<string, unknown>;
}

async function findDefaultWallet(token: string): Promise<string | undefined> {
  for (let attempt = 0; attempt < 15; attempt++) {
    const res = await request('get', 'wallet/list-all', {
      token,
      query: { size: 50 },
    });
    if (res.status === 200) {
      const content = (asRecord(res.body).content ?? []) as Array<
        Record<string, unknown>
      >;
      const cartera = content.find((wallet) => wallet.name === 'Cartera');
      if (cartera?.id) return String(cartera.id);
    }
    await delay(400);
  }
  return undefined;
}

export async function registerAndLogin(): Promise<Session> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `e2e+${unique}@cartera-e2e.test`;
  const password = 'e2e-Passw0rd!';

  const registration = await request('post', 'auth/account', {
    body: { email, password, firstName: 'E2E', lastName: 'Tester' },
  });
  if (registration.status !== 201) {
    throw new Error(
      `registration failed: ${registration.status} ${JSON.stringify(
        registration.body,
      )}`,
    );
  }

  const login = await request('post', 'auth/session', {
    body: { email, password },
  });
  if (login.status !== 200) {
    throw new Error(
      `login failed: ${login.status} ${JSON.stringify(login.body)}`,
    );
  }

  const loginBody = asRecord(login.body);
  const token = String(loginBody.accessToken);
  const userId = String(loginBody.userId ?? asRecord(registration.body).userId);
  recordUser(userId, userId);

  let personId: string | undefined;
  const me = await request('get', 'person/me', { token });
  if (me.status === 200) {
    const id = asRecord(me.body).id;
    if (id) personId = String(id);
  }

  const defaultWalletId = await findDefaultWallet(token);

  return {
    token,
    userId,
    authUid: userId,
    personId,
    defaultWalletId,
    email,
    password,
  };
}
