import { runValidate } from '@/packages/clients/class-validator';
import { DescriptionEnumParamSchema } from './description-enum-param.schema';

const options = { whitelist: true, forbidNonWhitelisted: true };

describe('DescriptionEnumParamSchema', () => {
  it('accepts a valid descriptionEnum', async () => {
    const errors = await runValidate(
      DescriptionEnumParamSchema,
      { description_enum: 'OVERDUE' },
      options,
    );
    expect(errors).toHaveLength(0);
  });

  it('accepts IN_PROGRESS (new member of the closed set)', async () => {
    const errors = await runValidate(
      DescriptionEnumParamSchema,
      { description_enum: 'IN_PROGRESS' },
      options,
    );
    expect(errors).toHaveLength(0);
  });

  it('rejects a descriptionEnum outside the closed set', async () => {
    const errors = await runValidate(
      DescriptionEnumParamSchema,
      { description_enum: 'NOPE' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects unknown props', async () => {
    const errors = await runValidate(
      DescriptionEnumParamSchema,
      { description_enum: 'PAID', extra: 'x' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
