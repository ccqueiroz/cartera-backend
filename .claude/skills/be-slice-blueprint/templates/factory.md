# Factory and wiring

`src/features/<feature>/<feature>.factory.ts`: the only place in the feature that knows concrete infra classes. Receives what comes from outside (db, guard, ports of other features, optional `generateId`/`now` for tests); builds repository → use cases → controller → routes; returns `{ routes, internal }` (`internal` only when another feature consumes this one; it exposes use cases, never the repository). Features with no HTTP (financial-indicator) return `{ internal }` only.

```ts
export interface BudgetModuleDeps {
  db: Firestore;
  authMiddleware: Middleware;
  categoryGateway: CategoryGateway;
  generateId?: () => string;
  now?: () => string;
}

export interface BudgetModule {
  routes: Route[];
  internal: { getById: GetBudgetByIdUseCase };
}

export function makeBudgetModule(deps: BudgetModuleDeps): BudgetModule {
  const generateId = deps.generateId ?? (() => crypto.randomUUID());
  const now = deps.now ?? (() => new Date().toISOString());
  const repository = BudgetRepositoryFirestore.create(deps.db);
  const getById = GetBudgetByIdUseCase.create(repository);
  const controller = BudgetController.create({
    create: CreateBudgetUseCase.create(
      repository,
      deps.categoryGateway,
      generateId,
      now,
    ),
    list: ListBudgetsUseCase.create(repository),
    getById,
    edit: EditBudgetUseCase.create(repository, now),
    remove: DeleteBudgetUseCase.create(repository, now),
  });
  return {
    routes: budgetRoutes(controller, deps.authMiddleware),
    internal: { getById },
  };
}
```

Wiring in `src/bootstrap/main.ts`: call the factory after the features it consumes (support → consumer), build the adapter inline from the owner's `internal`, spread `routes` into `ApiExpress.create({ routes: [...] })`. `crypto` comes from `@/packages/clients/crypto`; `Firestore` type from `firebase-admin/firestore` (the factory is a connector, so it may name them).
