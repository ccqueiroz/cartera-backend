import { runValidate } from '@/packages/clients/class-validator';
import { UpdatePaymentMethodSchema } from './update-payment-method.schema';

const dropUnknown = { whitelist: true, forbidNonWhitelisted: false };

describe('UpdatePaymentMethodSchema', () => {
  it('accepts a valid description', async () => {
    const errors = await runValidate(
      UpdatePaymentMethodSchema,
      { description: 'Pix QR' },
      dropUnknown,
    );
    expect(errors).toHaveLength(0);
  });

  it('does not fail on a descriptionEnum (dropped by the whitelist, not rejected)', async () => {
    const errors = await runValidate(
      UpdatePaymentMethodSchema,
      { description: 'Pix QR', descriptionEnum: 'CASH' },
      dropUnknown,
    );
    expect(errors).toHaveLength(0);
  });

  it('rejects an empty description', async () => {
    const errors = await runValidate(
      UpdatePaymentMethodSchema,
      { description: '' },
      dropUnknown,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects a description longer than 60 characters', async () => {
    const errors = await runValidate(
      UpdatePaymentMethodSchema,
      { description: 'x'.repeat(61) },
      dropUnknown,
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
