import { Firestore } from 'firebase-admin/firestore';
import {
  PaymentStatusCatalog,
  PaymentStatusCatalogPersistence,
} from '@/features/payment-status/domain/payment-status-catalog.entity';
import { PaymentStatusRepository } from '@/features/payment-status/domain/ports/payment-status.repository.port';
import { PaymentStatusRepositoryFirestore } from '@/features/payment-status/infra/persistence/payment-status.repository.firestore';
import { PaymentStatusEnum } from '@/shared/kernel/enums/payment-status.enum';
import { firestoreEmulator } from '@/test/support/firestore-emulator';

jest.setTimeout(60_000);

let db: Firestore;

beforeAll(async () => {
  db = await firestoreEmulator.connect();
});
beforeEach(() => firestoreEmulator.clear());
afterAll(() => db.terminate());

const { PAID, OVERDUE } = PaymentStatusEnum;

function persistence(
  overrides: Partial<PaymentStatusCatalogPersistence> = {},
): PaymentStatusCatalogPersistence {
  return {
    id: 'ps-1',
    code: PAID,
    label: 'Pago',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const overdue = persistence({ id: 'ps-2', code: OVERDUE, label: 'Vencido' });

const output = ({ id, code, label }: PaymentStatusCatalogPersistence) => ({
  id,
  code,
  label,
});

// The port has no create: the catalog is seeded straight into Payment_Status, so the finders
// also prove the collection name; every hand-seeded document carries deletedAt: null, never a
// missing field.
const seed = (...rows: PaymentStatusCatalogPersistence[]) =>
  Promise.all(
    rows.map((row) =>
      db
        .collection('Payment_Status')
        .doc(row.id)
        .set({ ...row, deletedAt: null }),
    ),
  );

const reread = async (found: Promise<PaymentStatusCatalog | null>) =>
  (await found)?.toOutput() ?? null;

const adapters: [string, () => PaymentStatusRepository][] = [
  ['firestore (emulator)', () => PaymentStatusRepositoryFirestore.create(db)],
];

describe.each(adapters)(
  'PaymentStatusRepository contract - %s',
  (_name, makeRepository) => {
    it('[BK3-14] listAll returns every seeded status', async () => {
      await seed(overdue, persistence());

      const listed = (await makeRepository().listAll()).map((status) =>
        status.toOutput(),
      );

      expect(listed.sort((a, b) => a.id.localeCompare(b.id))).toEqual([
        output(persistence()),
        output(overdue),
      ]);
    });

    it('[BK3-14] listAll returns [] when no status is seeded', async () => {
      expect(await makeRepository().listAll()).toEqual([]);
    });

    it('[BK3-14] findByCode returns the status of the code, with a status of another code as a decoy', async () => {
      await seed(persistence(), overdue);

      expect(await reread(makeRepository().findByCode(OVERDUE))).toEqual(
        output(overdue),
      );
    });

    it('[BK3-14] findByCode returns null when no status has the code, with a status of another code as a decoy', async () => {
      await seed(persistence());

      expect(await makeRepository().findByCode(OVERDUE)).toBeNull();
    });
  },
);
