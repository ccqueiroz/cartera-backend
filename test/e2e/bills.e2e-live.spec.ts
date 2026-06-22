import { request } from './support/http-client';
import { recordEntity } from './support/manifest';
import { contentIds, idOf } from './support/output';
import { pickCatalogIds, CatalogIds } from './support/pick-catalog-ids';
import { registerAndLogin, Session } from './support/register-and-login';

describe('bills (e2e-live)', () => {
  let session: Session;
  let catalog: CatalogIds;
  let fundedWalletId: string;

  beforeAll(async () => {
    session = await registerAndLogin();
    catalog = await pickCatalogIds(session.token);
    const wallet = await request('post', 'wallet/create', {
      token: session.token,
      body: { name: 'Bills Fund', balance: 5000 },
    });
    fundedWalletId = String(
      (wallet.body as Record<string, unknown>).wallet
        ? (
            (wallet.body as Record<string, unknown>).wallet as Record<
              string,
              unknown
            >
          ).id
        : '',
    );
    recordEntity('wallet', fundedWalletId);
  });

  it('create-single + installment → list → period → get → edit → settle → global → reverse → delete', async () => {
    const single = await request('post', 'bill/create', {
      token: session.token,
      body: {
        amount: 100,
        dueDate: '2030-01-10',
        categoryDescriptionEnum: catalog.billCategoryEnum,
        paymentMethodDescriptionEnum: catalog.paymentMethodEnum,
      },
    });
    expect(single.status).toBe(201);
    const singleId = idOf(single.body);
    recordEntity('bill', singleId);

    const installment = await request('post', 'bill/create-installment', {
      token: session.token,
      body: {
        amount: 600,
        dueDate: '2030-02-10',
        categoryDescriptionEnum: catalog.billCategoryEnum,
        installments: [
          { amount: 300, dueDate: '2030-03-10' },
          { amount: 300, dueDate: '2030-04-10' },
        ],
      },
    });
    expect(installment.status).toBe(201);
    const motherId = idOf(installment.body);
    recordEntity('bill', motherId);

    const list = await request('get', 'bill/list-all', {
      token: session.token,
      query: { scope: 'to_pay' },
    });
    expect(list.status).toBe(200);
    expect(contentIds(list.body)).toContain(singleId);

    const byPeriod = await request('get', 'bill/list-unpaid-by-period', {
      token: session.token,
      query: { start_date: '2030-01-01', end_date: '2030-12-31' },
    });
    expect(byPeriod.status).toBe(200);

    const detail = await request('get', `bill/list-by-id/${singleId}`, {
      token: session.token,
    });
    expect(detail.status).toBe(200);

    const edited = await request('put', `bill/edit/${singleId}`, {
      token: session.token,
      body: { amount: 120 },
    });
    expect(edited.status).toBe(200);

    const settled = await request('patch', `bill/settle/${singleId}`, {
      token: session.token,
      body: {
        walletId: fundedWalletId,
        paidAmount: 120,
        paymentDate: '2030-01-09',
        paymentMethodDescriptionEnum: catalog.paymentMethodEnum,
      },
    });
    expect(settled.status).toBe(200);

    const globalSettle = await request(
      'patch',
      `bill/global-settlement/${motherId}`,
      {
        token: session.token,
        body: {
          walletId: fundedWalletId,
          paymentDate: '2030-02-09',
          paymentMethodDescriptionEnum: catalog.paymentMethodEnum,
        },
      },
    );
    expect(globalSettle.status).toBe(200);

    const reversed = await request('patch', `bill/reverse/${singleId}`, {
      token: session.token,
    });
    expect(reversed.status).toBe(200);

    const deleted = await request('delete', `bill/delete/${singleId}`, {
      token: session.token,
    });
    expect(deleted.status).toBe(204);

    const afterDelete = await request('get', 'bill/list-all', {
      token: session.token,
      query: { scope: 'to_pay' },
    });
    expect(contentIds(afterDelete.body)).not.toContain(singleId);
  });
});
