import { PaymentStatusRepositoryFirestore } from '@/features/payment-status/infra/persistence/payment-status.repository.firestore';
import {
  PaymentStatusCatalog,
  PaymentStatusCatalogPersistence,
} from '@/features/payment-status/domain/payment-status-catalog.entity';
import { PaymentStatusEnum } from '@/shared/kernel/enums/payment-status.enum';

function persistence(
  overrides: Partial<PaymentStatusCatalogPersistence> = {},
): PaymentStatusCatalogPersistence {
  return {
    id: 'ps-1',
    code: PaymentStatusEnum.PAID,
    label: 'Pago',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function querySnapshot(rows: PaymentStatusCatalogPersistence[]) {
  return {
    empty: rows.length === 0,
    docs: rows.map((row) => ({ data: () => row })),
  };
}

function makeDb() {
  const get = jest.fn();
  const limitStub = { get };
  const whereStub: any = {
    where: () => whereStub,
    limit: () => limitStub,
    get,
  };
  const collectionStub = {
    where: jest.fn(() => whereStub),
    get,
  };
  const db = { collection: jest.fn(() => collectionStub) } as any;

  return { db, get, collectionStub };
}

describe('PaymentStatusRepositoryFirestore', () => {
  it('reads from the Payment_Status collection on listAll', async () => {
    const { db, get } = makeDb();
    get.mockResolvedValueOnce(
      querySnapshot([
        persistence({ id: 'ps-1', code: PaymentStatusEnum.PAID }),
        persistence({ id: 'ps-2', code: PaymentStatusEnum.OVERDUE }),
      ]),
    );
    const repo = PaymentStatusRepositoryFirestore.create(db);

    const list = await repo.listAll();

    expect(db.collection).toHaveBeenCalledWith('Payment_Status');
    expect(list.map((entry) => entry.code)).toEqual([
      PaymentStatusEnum.PAID,
      PaymentStatusEnum.OVERDUE,
    ]);
  });

  it('listAll returns [] when the collection is empty', async () => {
    const { db, get } = makeDb();
    get.mockResolvedValueOnce(querySnapshot([]));
    const repo = PaymentStatusRepositoryFirestore.create(db);

    expect(await repo.listAll()).toEqual([]);
  });

  it('findByCode returns the catalog entry when present', async () => {
    const { db, get } = makeDb();
    get.mockResolvedValueOnce(querySnapshot([persistence()]));
    const repo = PaymentStatusRepositoryFirestore.create(db);

    const found = await repo.findByCode(PaymentStatusEnum.PAID);

    expect(found).toBeInstanceOf(PaymentStatusCatalog);
    expect(found?.code).toBe(PaymentStatusEnum.PAID);
  });

  it('findByCode returns null when no document is seeded for the code', async () => {
    const { db, get } = makeDb();
    get.mockResolvedValueOnce(querySnapshot([]));
    const repo = PaymentStatusRepositoryFirestore.create(db);

    expect(await repo.findByCode(PaymentStatusEnum.OVERDUE)).toBeNull();
  });
});
