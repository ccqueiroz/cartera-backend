import { runValidate } from '@/packages/clients/class-validator';
import { DescriptionEnumParamSchema } from './description-enum-param.schema';

const options = { whitelist: true, forbidNonWhitelisted: true };

describe('DescriptionEnumParamSchema', () => {
  it('aceita descriptionEnum válido', async () => {
    const errors = await runValidate(
      DescriptionEnumParamSchema,
      { descriptionEnum: 'OVERDUE' },
      options,
    );
    expect(errors).toHaveLength(0);
  });

  it('rejeita descriptionEnum fora do conjunto fechado', async () => {
    const errors = await runValidate(
      DescriptionEnumParamSchema,
      { descriptionEnum: 'NOPE' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejeita props desconhecidas', async () => {
    const errors = await runValidate(
      DescriptionEnumParamSchema,
      { descriptionEnum: 'PAID', extra: 'x' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
