import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { request } from './support/http-client';
import { recordEntity } from './support/manifest';
import { registerAndLogin, Session } from './support/register-and-login';

function walletId(createBody: unknown): string {
  const wallet = (createBody as Record<string, unknown>).wallet as Record<
    string,
    unknown
  >;
  return String(wallet.id);
}

describe('wallet (e2e-live)', () => {
  let session: Session;

  beforeAll(async () => {
    session = await registerAndLogin();
  });

  it('create → list → get → update → delete', async () => {
    const created = await request('post', 'wallet/create', {
      token: session.token,
      body: { name: 'E2E Wallet' },
    });
    expect(created.status).toBe(201);
    const id = walletId(created.body);
    recordEntity('wallet', id);

    const list = await request('get', 'wallet/list-all', {
      token: session.token,
      query: { size: 50 },
    });
    expect(list.status).toBe(200);
    const ids = (
      (list.body as Record<string, unknown>).content as Array<
        Record<string, unknown>
      >
    ).map((wallet) => String(wallet.id));
    expect(ids).toContain(id);

    const got = await request('get', `wallet/list-by-id/${id}`, {
      token: session.token,
    });
    expect(got.status).toBe(200);
    expect((got.body as Record<string, unknown>).id).toBe(id);

    const updated = await request('put', `wallet/edit/${id}`, {
      token: session.token,
      body: { name: 'E2E Wallet Renamed' },
    });
    expect(updated.status).toBe(200);
    expect((updated.body as Record<string, unknown>).name).toBe(
      'E2E Wallet Renamed',
    );

    const deleted = await request('delete', `wallet/delete/${id}`, {
      token: session.token,
    });
    expect(deleted.status).toBe(204);
  });

  it('delete with balance and no force → WALLET_HAS_BALANCE', async () => {
    const created = await request('post', 'wallet/create', {
      token: session.token,
      body: { name: 'E2E Wallet With Balance', balance: 100 },
    });
    expect(created.status).toBe(201);
    const id = walletId(created.body);
    recordEntity('wallet', id);

    const blocked = await request('delete', `wallet/delete/${id}`, {
      token: session.token,
    });
    expect(blocked.status).toBe(422);
    expect((blocked.body as Record<string, unknown>).code).toBe(
      ErrorCode.WALLET_HAS_BALANCE,
    );

    const forced = await request('delete', `wallet/delete/${id}`, {
      token: session.token,
      query: { force: true },
    });
    expect(forced.status).toBe(204);
  });
});
