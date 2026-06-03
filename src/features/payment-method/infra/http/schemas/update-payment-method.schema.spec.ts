import { runValidate } from '@/packages/clients/class-validator';
import { UpdatePaymentMethodSchema } from './update-payment-method.schema';

const dropUnknown = { whitelist: true, forbidNonWhitelisted: false };

describe('UpdatePaymentMethodSchema', () => {
  it('aceita description válido', async () => {
    const errors = await runValidate(
      UpdatePaymentMethodSchema,
      { description: 'Pix QR' },
      dropUnknown,
    );
    expect(errors).toHaveLength(0);
  });

  it('não erra ao receber descriptionEnum (descartado pelo whitelist, não rejeitado)', async () => {
    const errors = await runValidate(
      UpdatePaymentMethodSchema,
      { description: 'Pix QR', descriptionEnum: 'CASH' },
      dropUnknown,
    );
    expect(errors).toHaveLength(0);
  });

  it('rejeita description vazio', async () => {
    const errors = await runValidate(
      UpdatePaymentMethodSchema,
      { description: '' },
      dropUnknown,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejeita description acima de 60 caracteres', async () => {
    const errors = await runValidate(
      UpdatePaymentMethodSchema,
      { description: 'x'.repeat(61) },
      dropUnknown,
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
