import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { BalanceWarning } from '@/shared/kernel/value-objects/balance-warnings';
import { request } from './support/http-client';
import { recordEntity } from './support/manifest';
import { registerAndLogin, Session } from './support/register-and-login';

type Rec = Record<string, unknown>;

function asRec(value: unknown): Rec {
  return (value ?? {}) as Rec;
}

function walletOf(createBody: unknown): Rec {
  return asRec(asRec(createBody).wallet);
}

async function createWallet(token: string, body: Rec): Promise<Rec> {
  const created = await request('post', 'wallet/create', { token, body });
  expect(created.status).toBe(201);
  const wallet = walletOf(created.body);
  recordEntity('wallet', String(wallet.id));
  return wallet;
}

describe('wallet (e2e-live)', () => {
  let session: Session;

  beforeAll(async () => {
    session = await registerAndLogin();
  });

  it('signup provisions exactly one default "Cartera" as pure cash', async () => {
    const list = await request('get', 'wallet/list-all', {
      token: session.token,
      query: { size: 50 },
    });
    expect(list.status).toBe(200);
    const content = (asRec(list.body).content ?? []) as Rec[];
    const defaults = content.filter((wallet) => wallet.isDefault === true);
    expect(defaults).toHaveLength(1);
    expect(defaults[0].name).toBe('Cartera');
    expect(defaults[0].overdraft).toBeNull();
    expect(defaults[0].balance).toBe(0);
  });

  it('common wallet lifecycle: create (pure cash) → list → get → rename → delete', async () => {
    const wallet = await createWallet(session.token, { name: 'E2E Wallet' });
    expect(wallet.isDefault).toBe(false);
    expect(wallet.overdraft).toBeNull();
    const id = String(wallet.id);

    const list = await request('get', 'wallet/list-all', {
      token: session.token,
      query: { size: 50 },
    });
    const ids = ((asRec(list.body).content ?? []) as Rec[]).map((w) =>
      String(w.id),
    );
    expect(ids).toContain(id);

    const got = await request('get', `wallet/list-by-id/${id}`, {
      token: session.token,
    });
    expect(got.status).toBe(200);
    expect(asRec(got.body).id).toBe(id);

    const renamed = await request('put', `wallet/edit/${id}`, {
      token: session.token,
      body: { name: 'E2E Wallet Renamed' },
    });
    expect(renamed.status).toBe(200);
    expect(asRec(renamed.body).name).toBe('E2E Wallet Renamed');

    const deleted = await request('delete', `wallet/delete/${id}`, {
      token: session.token,
    });
    expect(deleted.status).toBe(204);
  });

  it('create with hasOverdraft builds the policy (rate 0.08, grace 0)', async () => {
    const wallet = await createWallet(session.token, {
      name: 'E2E Overdraft',
      hasOverdraft: true,
      overdraftLimit: 500,
    });
    expect(wallet.overdraft).toMatchObject({
      limit: 500,
      monthlyRate: 0.08,
      graceDays: 0,
      since: null,
    });
  });

  it('create with hasOverdraft but no positive limit → OVERDRAFT_LIMIT_REQUIRED (400)', async () => {
    const missing = await request('post', 'wallet/create', {
      token: session.token,
      body: { name: 'E2E No Limit', hasOverdraft: true },
    });
    expect(missing.status).toBe(400);
    expect(asRec(missing.body).code).toBe(ErrorCode.OVERDRAFT_LIMIT_REQUIRED);

    const zero = await request('post', 'wallet/create', {
      token: session.token,
      body: { name: 'E2E Zero Limit', hasOverdraft: true, overdraftLimit: 0 },
    });
    expect(zero.status).toBe(400);
    expect(asRec(zero.body).code).toBe(ErrorCode.OVERDRAFT_LIMIT_REQUIRED);
  });

  it('isDefault in the create payload is rejected by the whitelist (VALIDATION_FAILED)', async () => {
    const res = await request('post', 'wallet/create', {
      token: session.token,
      body: { name: 'E2E Sneaky Default', isDefault: true },
    });
    expect(res.status).toBe(400);
    expect(asRec(res.body).code).toBe(ErrorCode.VALIDATION_FAILED);
  });

  it('edit toggles overdraft on a common wallet: enable then disable (back to cash)', async () => {
    const wallet = await createWallet(session.token, { name: 'E2E Toggle' });
    const id = String(wallet.id);

    const enabled = await request('put', `wallet/edit/${id}`, {
      token: session.token,
      body: { hasOverdraft: true, overdraftLimit: 300 },
    });
    expect(enabled.status).toBe(200);
    expect(asRec(asRec(enabled.body).overdraft).limit).toBe(300);

    const disabled = await request('put', `wallet/edit/${id}`, {
      token: session.token,
      body: { hasOverdraft: false },
    });
    expect(disabled.status).toBe(200);
    expect(asRec(disabled.body).overdraft).toBeNull();
  });

  it('edit enabling overdraft without a positive limit → OVERDRAFT_LIMIT_REQUIRED (400)', async () => {
    const wallet = await createWallet(session.token, {
      name: 'E2E Enable Bad',
    });
    const id = String(wallet.id);
    const res = await request('put', `wallet/edit/${id}`, {
      token: session.token,
      body: { hasOverdraft: true },
    });
    expect(res.status).toBe(400);
    expect(asRec(res.body).code).toBe(ErrorCode.OVERDRAFT_LIMIT_REQUIRED);
  });

  it('disabling overdraft on a wallet in an open episode turns it to cash and keeps the negative balance', async () => {
    const wallet = await createWallet(session.token, {
      name: 'E2E Forgive',
      hasOverdraft: true,
      overdraftLimit: 1000,
    });
    const id = String(wallet.id);

    const withdraw = await request('patch', `wallet/adjust-balance/${id}`, {
      token: session.token,
      body: { operation: 'WITHDRAW', amount: 200, occurredAt: '2026-06-22' },
    });
    expect(withdraw.status).toBe(200);
    expect(asRec(asRec(withdraw.body).wallet).balance).toBe(-200);
    expect(asRec(asRec(withdraw.body).wallet).overdraft).toMatchObject({
      since: '2026-06-22',
    });

    const disabled = await request('put', `wallet/edit/${id}`, {
      token: session.token,
      body: { hasOverdraft: false },
    });
    expect(disabled.status).toBe(200);
    expect(asRec(disabled.body).overdraft).toBeNull();
    expect(asRec(disabled.body).balance).toBe(-200);

    // residual balance ≠ 0 → needs force to delete
    const forced = await request('delete', `wallet/delete/${id}`, {
      token: session.token,
      query: { force: true },
    });
    expect(forced.status).toBe(204);
  });

  it('withdraw on a pure-cash wallet warns BALANCE_NEGATIVE only, never OVERDRAFT_LIMIT_EXCEEDED', async () => {
    const wallet = await createWallet(session.token, { name: 'E2E Cash Neg' });
    const id = String(wallet.id);

    const withdraw = await request('patch', `wallet/adjust-balance/${id}`, {
      token: session.token,
      body: { operation: 'WITHDRAW', amount: 75, occurredAt: '2026-06-22' },
    });
    expect(withdraw.status).toBe(200);
    const warnings = (asRec(withdraw.body).warnings ?? []) as string[];
    expect(warnings).toContain(BalanceWarning.BALANCE_NEGATIVE);
    expect(warnings).not.toContain(BalanceWarning.OVERDRAFT_LIMIT_EXCEEDED);
    expect(asRec(asRec(withdraw.body).wallet).overdraft).toBeNull();

    await request('delete', `wallet/delete/${id}`, {
      token: session.token,
      query: { force: true },
    });
  });

  it('default wallet rejects overdraft (WALLET_DEFAULT_NO_OVERDRAFT) but allows rename', async () => {
    expect(session.defaultWalletId).toBeDefined();
    const id = String(session.defaultWalletId);

    const overdraft = await request('put', `wallet/edit/${id}`, {
      token: session.token,
      body: { hasOverdraft: true, overdraftLimit: 100 },
    });
    expect(overdraft.status).toBe(422);
    expect(asRec(overdraft.body).code).toBe(
      ErrorCode.WALLET_DEFAULT_NO_OVERDRAFT,
    );

    const renamed = await request('put', `wallet/edit/${id}`, {
      token: session.token,
      body: { name: 'Minha Cartera' },
    });
    expect(renamed.status).toBe(200);
    expect(asRec(renamed.body).name).toBe('Minha Cartera');
    expect(asRec(renamed.body).isDefault).toBe(true);
    expect(asRec(renamed.body).overdraft).toBeNull();
  });

  it('default wallet cannot be deleted, even with force (WALLET_NOT_DELETABLE)', async () => {
    const id = String(session.defaultWalletId);

    const plain = await request('delete', `wallet/delete/${id}`, {
      token: session.token,
    });
    expect(plain.status).toBe(422);
    expect(asRec(plain.body).code).toBe(ErrorCode.WALLET_NOT_DELETABLE);

    const forced = await request('delete', `wallet/delete/${id}`, {
      token: session.token,
      query: { force: true },
    });
    expect(forced.status).toBe(422);
    expect(asRec(forced.body).code).toBe(ErrorCode.WALLET_NOT_DELETABLE);

    const still = await request('get', `wallet/list-by-id/${id}`, {
      token: session.token,
    });
    expect(still.status).toBe(200);
    expect(asRec(still.body).isDefault).toBe(true);
  });

  it('delete with balance and no force → WALLET_HAS_BALANCE, then force → 204', async () => {
    const wallet = await createWallet(session.token, {
      name: 'E2E Wallet With Balance',
      balance: 100,
    });
    const id = String(wallet.id);

    const blocked = await request('delete', `wallet/delete/${id}`, {
      token: session.token,
    });
    expect(blocked.status).toBe(422);
    expect(asRec(blocked.body).code).toBe(ErrorCode.WALLET_HAS_BALANCE);

    const forced = await request('delete', `wallet/delete/${id}`, {
      token: session.token,
      query: { force: true },
    });
    expect(forced.status).toBe(204);
  });

  it('delete is idempotent: deleting a zero-balance wallet twice → 204 both times', async () => {
    const wallet = await createWallet(session.token, {
      name: 'E2E Idempotent',
    });
    const id = String(wallet.id);

    const first = await request('delete', `wallet/delete/${id}`, {
      token: session.token,
    });
    expect(first.status).toBe(204);

    const second = await request('delete', `wallet/delete/${id}`, {
      token: session.token,
    });
    expect(second.status).toBe(204);
  });
});
