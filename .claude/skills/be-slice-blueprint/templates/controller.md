# Controller

`infra/http/<feature>.controller.ts`. One per feature, private constructor + `static create(useCases)`; one arrow method per route (arrow keeps `this` when the route takes the reference); each method: `assertValid(schema, req.body)` → build the use case input from `req` (`userIdFrom(req)` for the tenant, `numberOrUndefined` for numeric query) → `res.status(N).json(result)`. Never `try/catch`: the `ErrorMiddleware` maps domain errors. The three helpers (`assertValid`, `userIdFrom`, `numberOrUndefined`) come from `@/shared/http/request-input`; never declare them in the controller (ESLint `no-restricted-syntax` blocks a copy).

```ts
import type { Request, Response } from 'express';
import {
  assertValid,
  numberOrUndefined,
  userIdFrom,
} from '@/shared/http/request-input';
import { CreateBudgetUseCase } from '@/features/budget/application/create-budget.usecase';
import { ListBudgetsUseCase } from '@/features/budget/application/list-budgets.usecase';
import { CreateBudgetSchema } from '@/features/budget/infra/http/schemas/create-budget.schema';

export interface BudgetUseCases {
  create: CreateBudgetUseCase;
  list: ListBudgetsUseCase /* ... */;
}

export class BudgetController {
  private constructor(private readonly useCases: BudgetUseCases) {}
  public static create(useCases: BudgetUseCases): BudgetController {
    return new BudgetController(useCases);
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    await assertValid(CreateBudgetSchema, req.body);
    const result = await this.useCases.create.execute({
      userId: userIdFrom(req),
      name: req.body.name,
      limit: req.body.limit,
      categoryDescriptionEnum: req.body.categoryDescriptionEnum,
    });
    res.status(201).json(result);
  };

  public listAll = async (req: Request, res: Response): Promise<void> => {
    const result = await this.useCases.list.execute({
      userId: userIdFrom(req),
      page: numberOrUndefined(req.query.page),
      size: numberOrUndefined(req.query.size),
    });
    res.status(200).json(result);
  };

  public remove = async (req: Request, res: Response): Promise<void> => {
    await this.useCases.remove.execute({
      userId: userIdFrom(req),
      id: String(req.params.id),
    });
    res.status(204).send();
  };
}
```

Status map: 201 create · 200 read/edit/action · 202 accepted (recovery e-mail) · 204 delete/signout · errors by class (see error-code template). `personId` never comes from the body: resolve it through the person port in the use case.
