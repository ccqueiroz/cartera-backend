# Schema spec

`infra/http/schemas/<verb>-<feature>.schema.spec.ts`. Same options as the controller; assert the PT-BR message and the rejected property.

```ts
import { runValidate } from '@/packages/clients/class-validator';
import { CreateBudgetSchema } from './create-budget.schema';

const REJECT_UNKNOWN = { whitelist: true, forbidNonWhitelisted: true };
const valid = { name: 'Housing', limit: 2500, categoryDescriptionEnum: 'RENT' };
const validate = (input: unknown) =>
  runValidate(CreateBudgetSchema, input, REJECT_UNKNOWN);

describe('CreateBudgetSchema', () => {
  it('accepts the canonical payload', async () => {
    expect(await validate(valid)).toHaveLength(0);
  });

  it('rejects a non-positive limit with the PT-BR message', async () => {
    const errors = await validate({ ...valid, limit: 0 });
    expect(Object.values(errors[0].constraints ?? {})).toContain(
      'O limite deve ser maior que zero.',
    );
  });

  it('rejects unknown fields', async () => {
    const errors = await validate({ ...valid, extra: true });
    expect(errors.map((error) => error.property)).toEqual(['extra']);
  });
});
```
