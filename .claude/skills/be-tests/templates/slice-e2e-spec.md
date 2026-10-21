# Slice e2e spec (in process)

`src/features/<feature>/<feature>.e2e.spec.ts`. The whole slice through the factory with a fake Firestore db, the real `VerifyTokenMiddleware` (session verifier as a literal) and the real `ErrorMiddleware`, dispatched without Express. Proves wiring, guard, validation and the `{message, code}` envelope end to end. Pattern of `src/features/category/category.e2e.spec.ts`, with a local `makeFakeDb()` until the shared fake exists.

```ts
const VALID_TOKEN = 'valid-token';
const sessionVerifier = {
  verifyToken: async ({ accessToken }: { accessToken: string }) => {
    if (accessToken !== VALID_TOKEN)
      throw new UnauthorizedError(ErrorCode.INVALID_TOKEN);
    return { userId: 'user-1', email: 'ana@example.com' };
  },
};

function makeHarness() {
  const authMiddleware = VerifyTokenMiddleware.create(sessionVerifier);
  const module = makeBudgetModule({
    db: makeFakeDb(),
    authMiddleware,
    categoryGateway: {
      resolve: async (e) =>
        e === 'RENT' ? { descriptionEnum: e, group: 'HOUSING' } : null,
    },
    generateId: () => 'budget-1',
    now: () => '2026-10-01T00:00:00.000Z',
  });
  const errorHandler = ErrorMiddleware.create(mockLogger).getHandler();
  return async (
    method: string,
    path: string,
    input: { body?: unknown; params?: Record<string, string>; token?: string },
  ) => {
    const route = module.routes.find(
      (candidate) => candidate.method === method && candidate.path === path,
    );
    if (!route) throw new Error(`route not registered: ${method} ${path}`);
    let statusCode = 0;
    let body: unknown;
    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(payload: unknown) {
        body = payload;
        return this;
      },
      send() {
        return this;
      },
    } as unknown as Response;
    const req = {
      body: input.body ?? {},
      params: input.params ?? {},
      query: {},
      headers: input.token ? { authorization: `Bearer ${input.token}` } : {},
      cookies: {},
    } as unknown as Request;
    try {
      for (const middleware of route.middlewares ?? [])
        await new Promise<void>((resolve, reject) =>
          middleware.getHandler()(req, res, (error?: unknown) =>
            error ? reject(error) : resolve(),
          ),
        );
      await route.handler(req, res, () => undefined);
    } catch (error) {
      errorHandler(error as Error, req, res, () => undefined);
    }
    return { statusCode, body };
  };
}

it('POST budget/create answers 201 and the created output', async () => {
  const dispatch = makeHarness();
  const response = await dispatch('post', 'budget/create', {
    token: VALID_TOKEN,
    body: { name: 'Housing', limit: 2500, categoryDescriptionEnum: 'RENT' },
  });
  expect(response.statusCode).toBe(201);
  expect(response.body).toMatchObject({ id: 'budget-1', active: true });
});

it('rejects without a session with 401 and the catalog code', async () => {
  const response = await makeHarness()('post', 'budget/create', { body: {} });
  expect(response.statusCode).toBe(401);
  expect(response.body).toMatchObject({ code: ErrorCode.INVALID_TOKEN });
});
```

Promote the `dispatch` harness to a shared test helper on the second feature that uses it (today four e2e specs carry their own copy).
