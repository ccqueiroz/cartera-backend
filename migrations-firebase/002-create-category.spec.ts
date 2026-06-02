import seedCategory from './002-create-category';

interface SeededDoc {
  id: string;
  descriptionEnum: string;
  createdAt: unknown;
  updatedAt: unknown;
  deletedAt: unknown;
  [key: string]: unknown;
}

function makeFakeDb() {
  const store = new Map<string, SeededDoc>();

  const collection = () => ({
    where: (field: string, _op: string, value: unknown) => ({
      limit: () => ({
        get: async () => {
          const match = [...store.values()].find(
            (doc) => (doc as Record<string, unknown>)[field] === value,
          );
          return {
            empty: !match,
            docs: match
              ? [
                  {
                    id: match.id,
                    data: () => match,
                    ref: {
                      set: async (data: SeededDoc) => {
                        store.set(data.id, data);
                      },
                    },
                  },
                ]
              : [],
          };
        },
      }),
    }),
    doc: (id: string) => ({
      set: async (data: SeededDoc) => {
        store.set(id, data);
      },
    }),
  });

  return { db: { collection } as any, store };
}

describe('002-create-category migration', () => {
  it('popula o catálogo com timestamps ISO-8601 na primeira execução', async () => {
    const { db, store } = makeFakeDb();

    await seedCategory(db);

    expect(store.size).toBe(242);
    const sample = [...store.values()][0];
    expect(typeof sample.createdAt).toBe('string');
    expect(sample.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T.*Z$/);
    expect(sample.deletedAt).toBeNull();
  });

  it('é idempotente: rodar 2× não cria duplicatas', async () => {
    const { db, store } = makeFakeDb();

    await seedCategory(db);
    const afterFirst = store.size;
    await seedCategory(db);

    expect(store.size).toBe(afterFirst);
    expect(afterFirst).toBe(242);

    const enums = [...store.values()].map((doc) => doc.descriptionEnum);
    expect(new Set(enums).size).toBe(enums.length);
  });

  it('preserva createdAt no upsert e seta updatedAt', async () => {
    const { db, store } = makeFakeDb();

    await seedCategory(db);
    const before = [...store.values()][0];
    const originalCreatedAt = before.createdAt;

    await seedCategory(db);
    const after = store.get(before.id) as SeededDoc;

    expect(after.createdAt).toBe(originalCreatedAt);
    expect(typeof after.updatedAt).toBe('string');
  });
});
