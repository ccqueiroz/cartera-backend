import { runValidate } from '@/packages/clients/class-validator';
import { CreateCategorySchema } from './create-category.schema';

const options = { whitelist: true, forbidNonWhitelisted: true };

describe('CreateCategorySchema', () => {
  it('accepts valid payload', async () => {
    const errors = await runValidate(
      CreateCategorySchema,
      {
        description: 'Uber',
        descriptionEnum: 'UBER',
        group: 'MOBILITY_BY_APP',
        type: 'BILLS',
      },
      options,
    );
    expect(errors).toHaveLength(0);
  });

  it('rejects unknown props', async () => {
    const errors = await runValidate(
      CreateCategorySchema,
      {
        description: 'Uber',
        descriptionEnum: 'UBER',
        group: 'MOBILITY_BY_APP',
        type: 'BILLS',
        userId: 'hacker',
      },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects group/type outside the enum', async () => {
    const errors = await runValidate(
      CreateCategorySchema,
      {
        description: 'Uber',
        descriptionEnum: 'UBER',
        group: 'NOPE',
        type: 'NOPE',
      },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
