import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { request } from './support/http-client';
import { idOf } from './support/output';
import { pickCatalogIds, CatalogIds } from './support/pick-catalog-ids';
import { registerAndLogin, Session } from './support/register-and-login';

describe('transversal (e2e-live)', () => {
  let userA: Session;
  let userB: Session;
  let catalog: CatalogIds;

  beforeAll(async () => {
    userA = await registerAndLogin();
    userB = await registerAndLogin();
    catalog = await pickCatalogIds(userA.token);
  });

  it('guarded route without token → 401', async () => {
    const res = await request('get', 'wallet/list-all');
    expect(res.status).toBe(401);
    expect((res.body as Record<string, unknown>).code).toBe(
      ErrorCode.INVALID_TOKEN,
    );
  });

  it('invalid payload → 400 VALIDATION_FAILED', async () => {
    const res = await request('post', 'bill/create', {
      token: userA.token,
      body: { dueDate: 'not-a-date' },
    });
    expect(res.status).toBe(400);
    expect((res.body as Record<string, unknown>).code).toBe(
      ErrorCode.VALIDATION_FAILED,
    );
  });

  it('cross-user: B cannot read A resource → 403/404', async () => {
    const billOfA = await request('post', 'bill/create', {
      token: userA.token,
      body: {
        amount: 100,
        dueDate: '2030-11-10',
        categoryDescriptionEnum: catalog.billCategoryEnum,
        paymentMethodDescriptionEnum: catalog.paymentMethodEnum,
      },
    });
    expect(billOfA.status).toBe(201);
    const billId = idOf(billOfA.body);

    const crossRead = await request('get', `bill/list-by-id/${billId}`, {
      token: userB.token,
    });
    expect([403, 404]).toContain(crossRead.status);
    expect((crossRead.body as Record<string, unknown>).code).toBe(
      ErrorCode.TRANSACTION_NOT_FOUND,
    );
  });
});
