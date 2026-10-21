# Use case spec

`application/<verb>-<feature>.usecase.spec.ts`. In-memory repository of the feature, other features' ports as object literals, `makeIds()` counter and a fixed `now`. Assert the result and the persisted effect; error cases by catalog code.

```ts
import { CreateBudgetUseCase } from './create-budget.usecase';
import { InMemoryBudgetRepository } from '@/features/budget/infra/persistence/in-memory-budget.repository';
import { CategoryGateway } from '@/features/budget/domain/ports/category.gateway.port';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const now = () => '2026-10-01T10:00:00.000Z';
const categoryGateway: CategoryGateway = {
  resolve: async (descriptionEnum) =>
    descriptionEnum === 'RENT' ? { descriptionEnum, group: 'HOUSING' } : null,
};
function makeIds() {
  let counter = 0;
  return () => `budget-${++counter}`;
}
function makeUseCase(repository = new InMemoryBudgetRepository()) {
  return {
    repository,
    useCase: CreateBudgetUseCase.create(
      repository,
      categoryGateway,
      makeIds(),
      now,
    ),
  };
}

describe('CreateBudgetUseCase', () => {
  it('creates an active budget and persists it', async () => {
    const { useCase, repository } = makeUseCase();
    const result = await useCase.execute({
      userId: 'user-1',
      name: 'Housing',
      limit: 2500,
      categoryDescriptionEnum: 'RENT',
    });
    expect(result.active).toBe(true);
    expect(
      await repository.findActiveById('budget-1', 'user-1'),
    ).not.toBeNull();
  });

  it('rejects an unknown category with CATEGORY_NOT_FOUND', async () => {
    const { useCase } = makeUseCase();
    await expect(
      useCase.execute({
        userId: 'user-1',
        name: 'Housing',
        limit: 2500,
        categoryDescriptionEnum: 'NOPE',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.CATEGORY_NOT_FOUND });
  });
});
```

Coordinators over the transaction engine (bills, receivables) build the engine with `makeTransactionEngine({ repository: new InMemoryTransactionTreeRepository(), ... })` and a `fakeRunner` for the `AtomicRunner` (see `bills-coordinators.spec.ts:46`); keep the suite per feature under ~300 lines, split by use case when it grows.
