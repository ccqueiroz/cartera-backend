import seedFinancialIndicators from './005-seed-financial-indicators';

interface SeededDoc {
  id: string;
  descriptionEnum: string;
  period: string;
  aliquota: number;
  fixedRate: number | null;
  refPeriodMonth: string | null;
  refPeriodYear: number;
  active: boolean;
  createdAt: unknown;
  updatedAt: unknown;
  deletedAt: unknown;
  [key: string]: unknown;
}

function makeFakeDb() {
  const store = new Map<string, SeededDoc>();

  const buildQuery = (predicates: [string, unknown][]) => ({
    where: (field: string, _op: string, value: unknown) =>
      buildQuery([...predicates, [field, value]]),
    limit: () => ({
      get: async () => {
        const match = [...store.values()].find((doc) =>
          predicates.every(([field, value]) => doc[field] === value),
        );
        return { empty: !match, docs: match ? [{ data: () => match }] : [] };
      },
    }),
  });

  const collection = () => ({
    where: (field: string, _op: string, value: unknown) =>
      buildQuery([[field, value]]),
    doc: (id: string) => ({
      set: async (data: SeededDoc) => {
        store.set(id, data);
      },
    }),
  });

  return { db: { collection } as any, store };
}

describe('005-seed-financial-indicators migration', () => {
  it('semeia o núcleo vigente com timestamps ISO-8601 e fração decimal', async () => {
    const { db, store } = makeFakeDb();

    await seedFinancialIndicators(db);

    expect(store.size).toBe(12);
    const sample = [...store.values()][0];
    expect(typeof sample.createdAt).toBe('string');
    expect(sample.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T.*Z$/);
    expect(sample.updatedAt).toBeNull();
    expect(sample.deletedAt).toBeNull();
    expect(sample.active).toBe(true);
  });

  it('grava o IOF de crédito com parte periódica e fixa separadas', async () => {
    const { db, store } = makeFakeDb();

    await seedFinancialIndicators(db);

    const iofPf = [...store.values()].find(
      (doc) => doc.descriptionEnum === 'IOF_CREDIT_PF',
    );
    expect(iofPf?.period).toBe('diario');
    expect(iofPf?.aliquota).toBe(0.000082);
    expect(iofPf?.fixedRate).toBe(0.0038);
    expect(iofPf?.refPeriodMonth).toBe('JUN');
    expect(iofPf?.refPeriodYear).toBe(2026);
  });

  it('taxa anual não carrega mês de competência (refPeriodMonth null)', async () => {
    const { db, store } = makeFakeDb();

    await seedFinancialIndicators(db);

    const selic = [...store.values()].find(
      (doc) => doc.descriptionEnum === 'SELIC',
    );
    expect(selic?.period).toBe('anual');
    expect(selic?.refPeriodMonth).toBeNull();
    expect(selic?.refPeriodYear).toBe(2026);
    expect(selic?.fixedRate).toBe(0);
  });

  it('indicador sem adicional fixo grava fixedRate = 0 (nunca null)', async () => {
    const { db, store } = makeFakeDb();

    await seedFinancialIndicators(db);

    const withoutFixed = [...store.values()].filter(
      (doc) =>
        doc.descriptionEnum !== 'IOF_CREDIT_PF' &&
        doc.descriptionEnum !== 'IOF_CREDIT_PJ',
    );
    for (const doc of withoutFixed) {
      expect(doc.fixedRate).toBe(0);
      expect(doc.fixedRate).not.toBeNull();
    }
  });

  it('é idempotente: rodar 2× não duplica o vigente', async () => {
    const { db, store } = makeFakeDb();

    await seedFinancialIndicators(db);
    const afterFirst = store.size;
    await seedFinancialIndicators(db);

    expect(store.size).toBe(afterFirst);
    expect(afterFirst).toBe(12);

    const keys = [...store.values()].map(
      (doc) =>
        `${doc.descriptionEnum}|${doc.refPeriodMonth}|${doc.refPeriodYear}`,
    );
    expect(new Set(keys).size).toBe(keys.length);
  });
});
