import { Firestore } from 'firebase-admin/firestore';
import {
  PaymentMethod,
  PaymentMethodPersistence,
} from '@/features/payment-method/domain/payment-method.entity';
import { PaymentMethodDescriptionEnum } from '@/features/payment-method/domain/enums/payment-method-description.enum';
import { PaymentMethodRepository } from '@/features/payment-method/domain/ports/payment-method.repository.port';
import { PaymentMethodRepositoryFirestore } from '@/features/payment-method/infra/persistence/payment-method.repository.firestore';
import { firestoreEmulator } from '@/test/support/firestore-emulator';

jest.setTimeout(60_000);

let db: Firestore;

beforeAll(async () => {
  db = await firestoreEmulator.connect();
});
beforeEach(() => firestoreEmulator.clear());
afterAll(() => db.terminate());

const { PIX, CASH } = PaymentMethodDescriptionEnum;
const JANUARY = '2026-01-15T00:00:00.000Z';
const FEBRUARY = '2026-02-01T00:00:00.000Z';
const MARCH = '2026-03-01T00:00:00.000Z';

function persistence(
  overrides: Partial<PaymentMethodPersistence> = {},
): PaymentMethodPersistence {
  return {
    id: 'pm-1',
    description: 'Pix',
    descriptionEnum: PIX,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: null,
    deletedAt: null,
    ...overrides,
  };
}

const cash = (overrides: Partial<PaymentMethodPersistence> = {}) =>
  persistence({ description: 'Cash', descriptionEnum: CASH, ...overrides });

// Seeded straight into Payment_Method, so the finders also prove the collection name.
const seed = (...rows: PaymentMethodPersistence[]) =>
  Promise.all(
    rows.map((row) => db.collection('Payment_Method').doc(row.id).set(row)),
  );

const reread = async (found: Promise<PaymentMethod | null>) =>
  (await found)?.toPersistence() ?? null;

const adapters: [string, () => PaymentMethodRepository][] = [
  ['firestore (emulator)', () => PaymentMethodRepositoryFirestore.create(db)],
];

describe.each(adapters)(
  'PaymentMethodRepository contract - %s',
  (_name, makeRepository) => {
    it('[BK3-13] create then findById returns the method, and null for a missing id', async () => {
      const repository = makeRepository();
      await repository.create(PaymentMethod.with(persistence()));

      expect(await reread(repository.findById('pm-1'))).toEqual(persistence());
      expect(await repository.findById('missing')).toBeNull();
    });

    it('[BK3-13] findActiveByEnum returns the active method of the enum, with an active method of another enum as a decoy', async () => {
      await seed(cash(), persistence({ id: 'pm-2' }));

      expect(await reread(makeRepository().findActiveByEnum(PIX))).toEqual(
        persistence({ id: 'pm-2' }),
      );
    });

    it('[BK3-13] findActiveByEnum returns null when the enum only has a deleted method', async () => {
      await seed(persistence({ deletedAt: FEBRUARY }));

      expect(await makeRepository().findActiveByEnum(PIX)).toBeNull();
    });

    it('[BK3-13] findLatestByEnum returns the active method of the enum over a deleted one', async () => {
      await seed(
        persistence({ deletedAt: FEBRUARY }),
        persistence({ id: 'pm-2' }),
      );

      expect(await reread(makeRepository().findLatestByEnum(PIX))).toEqual(
        persistence({ id: 'pm-2' }),
      );
    });

    it('[BK3-13] findLatestByEnum returns the most recently deleted method when the enum has no active one', async () => {
      await seed(
        cash({ deletedAt: MARCH }),
        persistence({ id: 'pm-2', deletedAt: JANUARY }),
        persistence({ id: 'pm-3', deletedAt: FEBRUARY }),
      );

      expect(await reread(makeRepository().findLatestByEnum(PIX))).toEqual(
        persistence({ id: 'pm-3', deletedAt: FEBRUARY }),
      );
    });

    it('[BK3-13] findLatestByEnum returns null when the enum has no method, with an active method of another enum as a decoy', async () => {
      await seed(cash());

      expect(await makeRepository().findLatestByEnum(PIX)).toBeNull();
    });

    it('[BK3-13] listActive returns only the active methods', async () => {
      await seed(
        cash({ id: 'pm-2' }),
        persistence({ id: 'pm-3', deletedAt: FEBRUARY }),
        persistence(),
      );

      const listed = await makeRepository().listActive();

      expect(listed.map((method) => method.id).sort()).toEqual([
        'pm-1',
        'pm-2',
      ]);
    });

    it('[BK3-13] update rewrites the document by id', async () => {
      const repository = makeRepository();
      await seed(persistence());
      const edited = PaymentMethod.with(persistence());
      edited.updateDescription('Pix instant', FEBRUARY);

      await repository.update(edited);

      expect(await reread(repository.findById('pm-1'))).toEqual(
        persistence({ description: 'Pix instant', updatedAt: FEBRUARY }),
      );
    });

    it('[BK3-13] softDelete rewrites the document by id', async () => {
      const repository = makeRepository();
      await seed(persistence());
      const removed = PaymentMethod.with(persistence());
      removed.softDelete(FEBRUARY);

      await repository.softDelete(removed);

      expect(await reread(repository.findById('pm-1'))).toEqual(
        persistence({ deletedAt: FEBRUARY, updatedAt: FEBRUARY }),
      );
    });
  },
);
