import { runValidate } from '@/packages/clients/class-validator';
import { CreatePaymentMethodSchema } from './create-payment-method.schema';

const options = { whitelist: true, forbidNonWhitelisted: true };

describe('CreatePaymentMethodSchema', () => {
  it('aceita payload válido', async () => {
    const errors = await runValidate(
      CreatePaymentMethodSchema,
      { description: 'Pix', descriptionEnum: 'PIX' },
      options,
    );
    expect(errors).toHaveLength(0);
  });

  it('rejeita descriptionEnum fora do conjunto fechado', async () => {
    const errors = await runValidate(
      CreatePaymentMethodSchema,
      { description: 'Bitcoin', descriptionEnum: 'BITCOIN' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejeita description vazio', async () => {
    const errors = await runValidate(
      CreatePaymentMethodSchema,
      { description: '', descriptionEnum: 'PIX' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejeita description acima de 60 caracteres', async () => {
    const errors = await runValidate(
      CreatePaymentMethodSchema,
      { description: 'x'.repeat(61), descriptionEnum: 'PIX' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejeita props desconhecidas', async () => {
    const errors = await runValidate(
      CreatePaymentMethodSchema,
      { description: 'Pix', descriptionEnum: 'PIX', userId: 'hacker' },
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
