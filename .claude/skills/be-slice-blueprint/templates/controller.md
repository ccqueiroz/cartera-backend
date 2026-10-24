# Controller

`infra/http/<feature>.controller.ts`. One per feature, private constructor + `static create(useCases)`; one arrow method per route (arrow keeps `this` when the route takes the reference); each method: `assertValid(schema, req.body)` → build the use case input from `req` (`userIdFrom(req)` for the tenant, `numberOrUndefined` for numeric query) → `res.status(N).json(result)`. Never `try/catch`: the `ErrorMiddleware` maps domain errors. The three helpers (`assertValid`, `userIdFrom`, `numberOrUndefined`) are declared at the top of the controller file, as in `src/features/wallet/infra/http/wallet.controller.ts`. A shared request-input module for them is planned, not in the repo yet: until it exists, declare them in the controller, do not import them.

```ts
import type { Request, Response } from 'express';
import {
  ClassConstructor,
  runValidate,
} from '@/packages/clients/class-validator';
import {
  UnauthorizedError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { CreateBudgetUseCase } from '@/features/budget/application/create-budget.usecase';
import { ListBudgetsUseCase } from '@/features/budget/application/list-budgets.usecase';
import { CreateBudgetSchema } from '@/features/budget/infra/http/schemas/create-budget.schema';

async function assertValid<T extends object>(
  schema: ClassConstructor<T>,
  input: unknown,
): Promise<void> {
  const errors = await runValidate(schema, input, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  if (errors.length) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .filter(Boolean)
      .join('; ');
    throw new ValidationError(
      ErrorCode.VALIDATION_FAILED,
      details ? { details } : undefined,
    );
  }
}

function userIdFrom(req: Request): string {
  const userId = req.user_auth?.userId;
  if (!userId) throw new UnauthorizedError(ErrorCode.INVALID_TOKEN);
  return userId;
}

function numberOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

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
