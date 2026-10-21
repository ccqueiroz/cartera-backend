# Bootstrap gateway adapter

`src/bootstrap/<consumer>-<owner>.gateway.adapter.ts`. Implements the port declared in the consumer by delegating to the owner feature's `internal` use cases; maps the owner's Output to the raw shape the port promises; translates only the error the port semantics need (`EntityNotFoundError` → `null`), lets the rest propagate. Never receives `Firestore`, never names a collection (the two wallet adapters that do are known violations, reported as warnings by `yarn arch:check`), never imports `@/shared/database`.

```ts
import {
  CategoryGateway,
  ResolvedCategory,
} from '@/features/budget/domain/ports/category.gateway.port';
import { GetCategoryByEnumUseCase } from '@/features/category/application/get-category-by-enum.usecase';
import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';

interface CategoryInternal {
  getByEnum: GetCategoryByEnumUseCase;
}

export class BudgetCategoryGatewayAdapter implements CategoryGateway {
  private constructor(private readonly categoryInternal: CategoryInternal) {}
  public static create(
    categoryInternal: CategoryInternal,
  ): BudgetCategoryGatewayAdapter {
    return new BudgetCategoryGatewayAdapter(categoryInternal);
  }

  public async resolve(
    descriptionEnum: string,
  ): Promise<ResolvedCategory | null> {
    try {
      const category = await this.categoryInternal.getByEnum.execute({
        descriptionEnum,
      });
      return {
        descriptionEnum: category.descriptionEnum,
        group: category.group,
      };
    } catch (error) {
      if (error instanceof EntityNotFoundError) return null;
      throw error;
    }
  }
}
```

In `main.ts`: `makeBudgetModule({ db, authMiddleware, categoryGateway: BudgetCategoryGatewayAdapter.create(category.reads) })`. Spec next to it (`be-tests` → adapter-spec): the adapter is pure, test with the internal use case as `jest.fn`.
