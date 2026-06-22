import { request } from './support/http-client';
import { recordEntity } from './support/manifest';
import { balanceOf, contentIds, idOf } from './support/output';
import { pickCatalogIds, CatalogIds } from './support/pick-catalog-ids';
import { registerAndLogin, Session } from './support/register-and-login';

describe('receivables (e2e-live)', () => {
  let session: Session;
  let catalog: CatalogIds;
  let walletId: string;

  beforeAll(async () => {
    session = await registerAndLogin();
    catalog = await pickCatalogIds(session.token);
    if (session.defaultWalletId) {
      walletId = session.defaultWalletId;
    } else {
      const created = await request('post', 'wallet/create', {
        token: session.token,
        body: { name: 'Receivables Wallet' },
      });
      walletId = String(
        (
          (created.body as Record<string, unknown>).wallet as Record<
            string,
            unknown
          >
        ).id,
      );
    }
    recordEntity('wallet', walletId);
  });

  it('mirrors bills: create-single + installment → list → period → get → edit → delete', async () => {
    const single = await request('post', 'receivable/create', {
      token: session.token,
      body: {
        amount: 150,
        dueDate: '2030-06-10',
        categoryDescriptionEnum: catalog.receivableCategoryEnum,
        paymentMethodDescriptionEnum: catalog.paymentMethodEnum,
      },
    });
    expect(single.status).toBe(201);
    const singleId = idOf(single.body);
    recordEntity('receivable', singleId);

    const installment = await request('post', 'receivable/create-installment', {
      token: session.token,
      body: {
        amount: 400,
        dueDate: '2030-07-10',
        categoryDescriptionEnum: catalog.receivableCategoryEnum,
        installments: [
          { amount: 200, dueDate: '2030-08-10' },
          { amount: 200, dueDate: '2030-09-10' },
        ],
      },
    });
    expect(installment.status).toBe(201);
    recordEntity('receivable', idOf(installment.body));

    const list = await request('get', 'receivable/list-all', {
      token: session.token,
      query: { scope: 'to_receive' },
    });
    expect(list.status).toBe(200);
    expect(contentIds(list.body)).toContain(singleId);

    const byPeriod = await request(
      'get',
      'receivable/list-unreceived-by-period',
      {
        token: session.token,
        query: { start_date: '2030-01-01', end_date: '2030-12-31' },
      },
    );
    expect(byPeriod.status).toBe(200);

    const detail = await request('get', `receivable/list-by-id/${singleId}`, {
      token: session.token,
    });
    expect(detail.status).toBe(200);

    const edited = await request('put', `receivable/edit/${singleId}`, {
      token: session.token,
      body: { amount: 175 },
    });
    expect(edited.status).toBe(200);

    const deleted = await request('delete', `receivable/delete/${singleId}`, {
      token: session.token,
    });
    expect(deleted.status).toBe(204);
  });

  it('settle credits the wallet; reverse debits it back', async () => {
    const before = balanceOf(
      (
        await request('get', `wallet/list-by-id/${walletId}`, {
          token: session.token,
        })
      ).body,
    );

    const created = await request('post', 'receivable/create', {
      token: session.token,
      body: {
        amount: 200,
        dueDate: '2030-10-10',
        categoryDescriptionEnum: catalog.receivableCategoryEnum,
        paymentMethodDescriptionEnum: catalog.paymentMethodEnum,
      },
    });
    expect(created.status).toBe(201);
    const receivableId = idOf(created.body);
    recordEntity('receivable', receivableId);

    const settled = await request(
      'patch',
      `receivable/settle/${receivableId}`,
      {
        token: session.token,
        body: {
          walletId,
          paidAmount: 200,
          paymentDate: '2030-10-09',
          paymentMethodDescriptionEnum: catalog.paymentMethodEnum,
        },
      },
    );
    expect(settled.status).toBe(200);

    const afterSettle = balanceOf(
      (
        await request('get', `wallet/list-by-id/${walletId}`, {
          token: session.token,
        })
      ).body,
    );
    expect(afterSettle).toBeCloseTo(before + 200, 2);

    const reversed = await request(
      'patch',
      `receivable/reverse/${receivableId}`,
      { token: session.token },
    );
    expect(reversed.status).toBe(200);

    const afterReverse = balanceOf(
      (
        await request('get', `wallet/list-by-id/${walletId}`, {
          token: session.token,
        })
      ).body,
    );
    expect(afterReverse).toBeCloseTo(before, 2);
  });
});
