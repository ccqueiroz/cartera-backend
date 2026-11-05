import { runValidate } from '@/packages/clients/class-validator';
import { CreatePaymentMethodSchema } from './create-payment-method.schema';

const options = { whitelist: true, forbidNonWhitelisted: true };

describe('CreatePaymentMethodSchema', () => {
  it('accepts a valid payload', async () => {
    const errors = await runValidate(
      CreatePaymentMethodSchema,
      { description: 'Pix', descriptionEnum: 'PIX' },
      options,
    );
    expect(errors).toHaveLength(0);
  });

  it('rejects a descriptionEnum outside the closed set', async () => {
    const errors = await runValidate(
      CreatePaymentMethodSchema,
      { description: 'Bitcoin', descriptionEnum: 'BITCOIN' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects an empty description', async () => {
    const errors = await runValidate(
      CreatePaymentMethodSchema,
      { description: '', descriptionEnum: 'PIX' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects a description longer than 60 characters', async () => {
    const errors = await runValidate(
      CreatePaymentMethodSchema,
      { description: 'x'.repeat(61), descriptionEnum: 'PIX' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects unknown props', async () => {
    const errors = await runValidate(
      CreatePaymentMethodSchema,
      { description: 'Pix', descriptionEnum: 'PIX', userId: 'hacker' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
