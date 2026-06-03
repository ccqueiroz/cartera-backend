import { PaymentMethodRepositoryFirestore } from '@/features/payment-method/infra/persistence/payment-method.repository.firestore';
import {
  PaymentMethod,
  PaymentMethodPersistence,
} from '@/features/payment-method/domain/payment-method.entity';
import { PaymentMethodDescriptionEnum } from '@/features/payment-method/domain/enums/payment-method-description.enum';

function persistence(
  overrides: Partial<PaymentMethodPersistence> = {},
): PaymentMethodPersistence {
  return {
    id: 'pm-1',
    description: 'Pix',
    descriptionEnum: PaymentMethodDescriptionEnum.PIX,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: null,
    deletedAt: null,
    ...overrides,
  };
}

function querySnapshot(rows: PaymentMethodPersistence[]) {
  return {
    empty: rows.length === 0,
    docs: rows.map((row) => ({ data: () => row })),
  };
}

function makeDb() {
  const whereGet = jest.fn();
  const docGet = jest.fn();
  const docSet = jest.fn().mockResolvedValue(undefined);

  const limitStub = { get: whereGet };
  const orderByStub = { limit: () => limitStub, get: whereGet };
  const whereStub: any = {
    where: () => whereStub,
    orderBy: () => orderByStub,
    limit: () => limitStub,
    get: whereGet,
  };
  const docStub = { set: docSet, get: docGet };
  const collectionStub = {
    doc: jest.fn(() => docStub),
    where: jest.fn(() => whereStub),
  };
  const db = { collection: jest.fn(() => collectionStub) } as any;

  return { db, whereGet, docGet, docSet, collectionStub };
}

describe('PaymentMethodRepositoryFirestore', () => {
  it('persists on the Payment_Method collection keyed by id', async () => {
    const { db, docSet, collectionStub } = makeDb();
    const repo = PaymentMethodRepositoryFirestore.create(db);
    const method = PaymentMethod.with(persistence());

    await repo.create(method);

    expect(db.collection).toHaveBeenCalledWith('Payment_Method');
    expect(collectionStub.doc).toHaveBeenCalledWith('pm-1');
    expect(docSet).toHaveBeenCalledWith(method.toPersistence());
  });

  it('findActiveByEnum returns the active method when present', async () => {
    const { db, whereGet } = makeDb();
    whereGet.mockResolvedValueOnce(querySnapshot([persistence()]));
    const repo = PaymentMethodRepositoryFirestore.create(db);

    const found = await repo.findActiveByEnum(PaymentMethodDescriptionEnum.PIX);

    expect(found?.id).toBe('pm-1');
    expect(found?.isActive).toBe(true);
  });

  it('findActiveByEnum returns null when no active method', async () => {
    const { db, whereGet } = makeDb();
    whereGet.mockResolvedValueOnce(querySnapshot([]));
    const repo = PaymentMethodRepositoryFirestore.create(db);

    const found = await repo.findActiveByEnum(PaymentMethodDescriptionEnum.PIX);

    expect(found).toBeNull();
  });

  it('findLatestByEnum falls back to most-recent soft-deleted when no active', async () => {
    const { db, whereGet } = makeDb();
    const softDeleted = persistence({
      id: 'pm-old',
      deletedAt: '2026-02-01T00:00:00.000Z',
    });
    whereGet
      .mockResolvedValueOnce(querySnapshot([]))
      .mockResolvedValueOnce(querySnapshot([softDeleted]));
    const repo = PaymentMethodRepositoryFirestore.create(db);

    const found = await repo.findLatestByEnum(PaymentMethodDescriptionEnum.PIX);

    expect(found?.id).toBe('pm-old');
    expect(found?.isActive).toBe(false);
  });

  it('findLatestByEnum returns null when neither active nor soft-deleted exists', async () => {
    const { db, whereGet } = makeDb();
    whereGet
      .mockResolvedValueOnce(querySnapshot([]))
      .mockResolvedValueOnce(querySnapshot([]));
    const repo = PaymentMethodRepositoryFirestore.create(db);

    const found = await repo.findLatestByEnum(PaymentMethodDescriptionEnum.PIX);

    expect(found).toBeNull();
  });

  it('findById returns the method when the document exists', async () => {
    const { db, docGet } = makeDb();
    docGet.mockResolvedValueOnce({
      exists: true,
      data: () => persistence(),
    });
    const repo = PaymentMethodRepositoryFirestore.create(db);

    const found = await repo.findById('pm-1');

    expect(found?.id).toBe('pm-1');
  });

  it('findById returns null when the document is missing', async () => {
    const { db, docGet } = makeDb();
    docGet.mockResolvedValueOnce({ exists: false });
    const repo = PaymentMethodRepositoryFirestore.create(db);

    expect(await repo.findById('missing')).toBeNull();
  });

  it('listActive maps every returned document', async () => {
    const { db, whereGet } = makeDb();
    whereGet.mockResolvedValueOnce(
      querySnapshot([
        persistence({ id: 'pm-1' }),
        persistence({
          id: 'pm-2',
          descriptionEnum: PaymentMethodDescriptionEnum.CASH,
        }),
      ]),
    );
    const repo = PaymentMethodRepositoryFirestore.create(db);

    const list = await repo.listActive();

    expect(list.map((method) => method.id)).toEqual(['pm-1', 'pm-2']);
  });

  it('update and softDelete write the persistence snapshot by id', async () => {
    const { db, docSet, collectionStub } = makeDb();
    const repo = PaymentMethodRepositoryFirestore.create(db);
    const method = PaymentMethod.with(persistence());

    await repo.update(method);
    await repo.softDelete(method);

    expect(collectionStub.doc).toHaveBeenCalledWith('pm-1');
    expect(docSet).toHaveBeenCalledTimes(2);
    expect(docSet).toHaveBeenLastCalledWith(method.toPersistence());
  });
});
