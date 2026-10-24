# Controller spec

`infra/http/<feature>.controller.spec.ts`. Use cases as `jest.fn`, minimal `Request`/`Response`; assert status, json and that validation blocks the use case. Domain errors propagate (the middleware is tested once in `error.middleware.spec.ts`).

```ts
import type { Request, Response } from 'express';
import { BudgetController } from '@/features/budget/infra/http/budget.controller';
import { ValidationError } from '@/shared/kernel/errors/domain.error';

function makeResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as Response;
}
function makeUseCases() {
  return {
    create: { execute: jest.fn() },
    list: { execute: jest.fn() },
    getById: { execute: jest.fn() },
    edit: { execute: jest.fn() },
    remove: { execute: jest.fn() },
  } as any;
}
const authenticated = (body: unknown, params = {}) =>
  ({
    body,
    params,
    query: {},
    user_auth: { userId: 'user-1', email: 'a@b.c' },
  } as unknown as Request);

describe('BudgetController', () => {
  it('create validates, calls the use case with the session userId and answers 201', async () => {
    const useCases = makeUseCases();
    const output = { id: 'budget-1', active: true };
    useCases.create.execute.mockResolvedValue(output);
    const res = makeResponse();
    await BudgetController.create(useCases).create(
      authenticated({
        name: 'Housing',
        limit: 2500,
        categoryDescriptionEnum: 'RENT',
      }),
      res,
    );
    expect(useCases.create.execute).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1' }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(output);
  });

  it('create rejects an invalid payload before reaching the use case', async () => {
    const useCases = makeUseCases();
    await expect(
      BudgetController.create(useCases).create(
        authenticated({ name: '' }),
        makeResponse(),
      ),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(useCases.create.execute).not.toHaveBeenCalled();
  });
});
```
