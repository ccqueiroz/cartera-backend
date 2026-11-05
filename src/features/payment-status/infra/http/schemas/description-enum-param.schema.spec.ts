import { runValidate } from '@/packages/clients/class-validator';
import { DescriptionEnumParamSchema } from './description-enum-param.schema';

const options = { whitelist: true, forbidNonWhitelisted: true };

describe('DescriptionEnumParamSchema', () => {
  it('accepts a valid descriptionEnum', async () => {
    const errors = await runValidate(
      DescriptionEnumParamSchema,
      { descriptionEnum: 'OVERDUE' },
      options,
    );
    expect(errors).toHaveLength(0);
  });

  it('accepts IN_PROGRESS (new member of the closed set)', async () => {
    const errors = await runValidate(
      DescriptionEnumParamSchema,
      { descriptionEnum: 'IN_PROGRESS' },
      options,
    );
    expect(errors).toHaveLength(0);
  });

  it('rejects a descriptionEnum outside the closed set', async () => {
    const errors = await runValidate(
      DescriptionEnumParamSchema,
      { descriptionEnum: 'NOPE' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects unknown props', async () => {
    const errors = await runValidate(
      DescriptionEnumParamSchema,
      { descriptionEnum: 'PAID', extra: 'x' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
