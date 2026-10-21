# Wiring specs: routes registry, factory, bootstrap adapter

## `<feature>.routes.spec.ts`

```ts
const controller = BudgetController.create({} as never);
const authMiddleware = { getHandler: jest.fn() } as unknown as Middleware;

it('registers every route with the canonical method and path', () => {
  const routes = budgetRoutes(controller, authMiddleware);
  expect(
    routes.map((route) => `${route.method.toUpperCase()} ${route.path}`),
  ).toEqual([
    'GET budget/list-all',
    'GET budget/list-by-id/:id',
    'POST budget/create',
    'PUT budget/edit/:id',
    'DELETE budget/delete/:id',
  ]);
});

it('guards every route with the session middleware', () => {
  const routes = budgetRoutes(controller, authMiddleware);
  expect(
    routes.every((route) => (route.middlewares ?? []).includes(authMiddleware)),
  ).toBe(true);
});
```

## `<feature>.factory.spec.ts`

```ts
it('builds the slice and exposes the routes plus the internal contract', () => {
  const module = makeBudgetModule({
    db: {} as never,
    authMiddleware,
    categoryGateway: { resolve: async () => null },
  });
  expect(module.routes).toHaveLength(5);
  expect(module.internal.getById).toBeDefined();
});
```

## `src/bootstrap/<consumer>-<owner>.gateway.adapter.spec.ts`

```ts
it('maps the owner output to the raw shape the port promises', async () => {
  const getByEnum = {
    execute: jest
      .fn()
      .mockResolvedValue({
        descriptionEnum: 'RENT',
        group: 'HOUSING',
        active: true,
      }),
  };
  await expect(
    BudgetCategoryGatewayAdapter.create({ getByEnum } as never).resolve('RENT'),
  ).resolves.toEqual({ descriptionEnum: 'RENT', group: 'HOUSING' });
});

it('translates EntityNotFoundError into null and lets other errors through', async () => {
  const notFound = {
    execute: jest
      .fn()
      .mockRejectedValue(new EntityNotFoundError(ErrorCode.CATEGORY_NOT_FOUND)),
  };
  await expect(
    BudgetCategoryGatewayAdapter.create({
      getByEnum: notFound,
    } as never).resolve('X'),
  ).resolves.toBeNull();
});
```
