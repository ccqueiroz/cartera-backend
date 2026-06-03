import { runValidate } from '@/packages/clients/class-validator';
import { StatusEnumParamSchema } from './status-enum-param.schema';

const options = { whitelist: true, forbidNonWhitelisted: true };

describe('StatusEnumParamSchema', () => {
  it('aceita status válido', async () => {
    const errors = await runValidate(
      StatusEnumParamSchema,
      { status: 'OVERDUE' },
      options,
    );
    expect(errors).toHaveLength(0);
  });

  it('rejeita status fora do conjunto fechado', async () => {
    const errors = await runValidate(
      StatusEnumParamSchema,
      { status: 'NOPE' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejeita props desconhecidas', async () => {
    const errors = await runValidate(
      StatusEnumParamSchema,
      { status: 'PAID', extra: 'x' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
