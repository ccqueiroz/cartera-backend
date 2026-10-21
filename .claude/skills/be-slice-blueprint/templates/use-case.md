# Use case

`application/<verb>-<feature>.usecase.ts`. One responsibility; private constructor + `static create(...)` with the same positional deps; `execute(input)` takes a plain input interface (declared in the file, not exported unless another use case reuses it) and returns the entity's `Output`, a `Page<Output>`, `void`, or a small result envelope declared in `application/<feature>-response.ts`. Dependencies: ports, kernel, `@/shared/query`, and injected `generateId`/`now`. Never express, Firestore, `@/packages`, `@/shared/database`.

```ts
import { Budget, BudgetOutput } from '@/features/budget/domain/budget.entity';
import { BudgetRepository } from '@/features/budget/domain/ports/budget.repository.port';
import { CategoryGateway } from '@/features/budget/domain/ports/category.gateway.port';
import {
  DuplicateEntityError,
  EntityNotFoundError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

interface CreateBudgetInput {
  userId: string;
  name: string;
  limit: number;
  categoryDescriptionEnum: string;
}

export class CreateBudgetUseCase {
  private constructor(
    private readonly repository: BudgetRepository,
    private readonly categoryGateway: CategoryGateway,
    private readonly generateId: () => string,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: BudgetRepository,
    categoryGateway: CategoryGateway,
    generateId: () => string,
    now: () => string,
  ): CreateBudgetUseCase {
    return new CreateBudgetUseCase(
      repository,
      categoryGateway,
      generateId,
      now,
    );
  }

  public async execute(input: CreateBudgetInput): Promise<BudgetOutput> {
    const category = await this.categoryGateway.resolve(
      input.categoryDescriptionEnum,
    );
    if (!category)
      throw new EntityNotFoundError(ErrorCode.CATEGORY_NOT_FOUND, {
        descriptionEnum: input.categoryDescriptionEnum,
      });

    const existing = await this.repository.listActiveByUser(input.userId);
    if (existing.some((budget) => budget.toOutput().name === input.name.trim()))
      throw new DuplicateEntityError(ErrorCode.BUDGET_ALREADY_EXISTS);

    const budget = Budget.create({
      id: this.generateId(),
      userId: input.userId,
      name: input.name,
      limit: input.limit,
      createdAt: this.now(),
    });
    await this.repository.create(budget);
    return budget.toOutput();
  }
}
```

Patterns already in the repo to copy, not reinvent: `loadOwned(id, userId)` private helper that throws `EntityNotFoundError` then `DuplicateEntityError(<X>_DELETED)` (edit-wallet.usecase.ts:46); civil "today" as `this.now().slice(0, 10)` until a São Paulo clock exists; pagination with `applyPagination` from `@/shared/query`. What never goes here: `try/catch` on a trusted port (let it propagate; the only accepted catches are compensation and best-effort cleanup with a log), `res`/`req`, collection names, `Date` formatting.
