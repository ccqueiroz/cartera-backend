import { runValidate } from '@/packages/clients/class-validator';
import { TypeQuerySchema } from './type-query.schema';

const options = { whitelist: true, forbidNonWhitelisted: true };

describe('TypeQuerySchema', () => {
  it('accepts valid type', async () => {
    const errors = await runValidate(
      TypeQuerySchema,
      { type: 'BILLS' },
      options,
    );
    expect(errors).toHaveLength(0);
  });

  it('rejects type outside the enum', async () => {
    const errors = await runValidate(
      TypeQuerySchema,
      { type: 'NOPE' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects unknown props', async () => {
    const errors = await runValidate(
      TypeQuerySchema,
      { type: 'BILLS', extra: 'x' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
