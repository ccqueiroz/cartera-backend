import { makePersonModule } from '@/features/person/person.factory';
import { Middleware } from '@/shared/http/middleware';

const makeDeps = () => ({
  db: { collection: jest.fn() } as any,
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() } as any,
  authMiddleware: { getHandler: jest.fn() } as unknown as Middleware,
  authGateway: {
    disableAccount: jest.fn(),
    revokeRefreshTokens: jest.fn(),
  },
  storageGateway: { upload: jest.fn(), delete: jest.fn() },
});

describe('makePersonModule', () => {
  it('monta as cinco rotas HTTP autenticadas', () => {
    const module = makePersonModule(makeDeps());

    expect(module.routes).toHaveLength(5);
    expect(
      module.routes.every((route) => (route.middlewares ?? []).length > 0),
    ).toBe(true);
  });

  it('expõe os contratos internos (UC1/UC7) sem rota HTTP', () => {
    const module = makePersonModule(makeDeps());

    expect(module.internal.createPerson).toBeDefined();
    expect(module.internal.findPersonByEmail).toBeDefined();
    expect(module.internal.findPersonByUserId).toBeDefined();
    expect(module.internal.findPersonByUserIdIncludingDeleted).toBeDefined();
    expect(module.internal.syncPersonEmail).toBeDefined();
  });

  it('aceita generateId/now injetados para teste determinístico', async () => {
    const deps = makeDeps();
    const queryEmpty = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
    };
    const docSet = jest.fn().mockResolvedValue(undefined);
    deps.db.collection.mockReturnValue({
      where: queryEmpty.where,
      doc: jest.fn(() => ({ set: docSet })),
    });
    queryEmpty.where.mockReturnValue(queryEmpty);

    const module = makePersonModule({
      ...deps,
      generateId: () => 'person-fixed',
      now: () => '2026-06-04T12:00:00.000Z',
    });
    const person = await module.internal.createPerson.execute({
      userId: 'user-1',
      email: 'caio@example.com',
      firstName: 'Caio',
      lastName: 'Queiroz',
    });

    expect(person.id).toBe('person-fixed');
    expect(person.toPersistence().createdAt).toBe('2026-06-04T12:00:00.000Z');
  });
});
