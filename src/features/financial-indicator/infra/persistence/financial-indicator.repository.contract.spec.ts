import { Firestore } from 'firebase-admin/firestore';
import { FinancialIndicatorPersistence } from '@/features/financial-indicator/domain/financial-indicator.entity';
import { FinancialIndicatorRepository } from '@/features/financial-indicator/domain/ports/financial-indicator.repository.port';
import { FinancialIndicatorRepositoryFirestore } from '@/features/financial-indicator/infra/persistence/financial-indicator.repository.firestore';
import { firestoreEmulator } from '@/test/support/firestore-emulator';

jest.setTimeout(60_000);

let db: Firestore;

beforeAll(async () => {
  db = await firestoreEmulator.connect();
});
beforeEach(() => firestoreEmulator.clear());
afterAll(() => db.terminate());

function indicator(
  overrides: Partial<FinancialIndicatorPersistence> = {},
): FinancialIndicatorPersistence {
  return {
    id: 'fi-2',
    name: 'Selic',
    descriptionEnum: 'SELIC',
    period: 'anual',
    aliquota: 0.15,
    fixedRate: 0,
    refPeriodMonth: null,
    refPeriodYear: 2026,
    active: true,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: null,
    deletedAt: null,
    ...overrides,
  };
}

// The port has no create: the indicators are seeded straight into the collection.
const seed = (data: FinancialIndicatorPersistence) =>
  db.collection('Financial_Indicator').doc(data.id).set(data);

const adapters: [string, () => FinancialIndicatorRepository][] = [
  [
    'firestore (emulator)',
    () => FinancialIndicatorRepositoryFirestore.create(db),
  ],
];

describe.each(adapters)(
  'FinancialIndicatorRepository contract - %s',
  (_name, makeRepository) => {
    it('[BK3-12] findActiveByEnum returns the active indicator of the enum, with an active indicator of another enum as a decoy', async () => {
      await seed(
        indicator({ id: 'fi-1', name: 'CDI', descriptionEnum: 'CDI' }),
      );
      await seed(indicator());

      const found = await makeRepository().findActiveByEnum('SELIC');

      expect(found?.toPersistence()).toEqual(indicator());
    });

    it('[BK3-12] findActiveByEnum returns null when the enum only has an indicator with active false and deletedAt null', async () => {
      await seed(indicator({ active: false }));

      expect(await makeRepository().findActiveByEnum('SELIC')).toBeNull();
    });

    it('[BK3-12] findActiveByEnum returns null when the enum only has an indicator with active true and deletedAt set', async () => {
      await seed(indicator({ deletedAt: '2026-06-15T00:00:00.000Z' }));

      expect(await makeRepository().findActiveByEnum('SELIC')).toBeNull();
    });
  },
);
