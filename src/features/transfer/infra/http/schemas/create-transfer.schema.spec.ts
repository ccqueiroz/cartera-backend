import { runValidate } from '@/packages/clients/class-validator';
import { CreateTransferSchema } from './create-transfer.schema';

const options = { whitelist: true, forbidNonWhitelisted: true };

function valid(overrides: Record<string, unknown> = {}) {
  return {
    fromWalletId: 'w1',
    toWalletId: 'w2',
    amount: 100,
    paymentMethodDescriptionEnum: 'PIX',
    ...overrides,
  };
}

describe('CreateTransferSchema', () => {
  it('aceita payload válido com transferDate', async () => {
    const errors = await runValidate(
      CreateTransferSchema,
      valid({ transferDate: '2026-06-10' }),
      options,
    );
    expect(errors).toHaveLength(0);
  });

  it('aceita payload válido sem transferDate (opcional)', async () => {
    const errors = await runValidate(CreateTransferSchema, valid(), options);
    expect(errors).toHaveLength(0);
  });

  it('rejeita fromWalletId vazio', async () => {
    const errors = await runValidate(
      CreateTransferSchema,
      valid({ fromWalletId: '' }),
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejeita amount não numérico', async () => {
    const errors = await runValidate(
      CreateTransferSchema,
      valid({ amount: 'dez' }),
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejeita paymentMethodDescriptionEnum fora do conjunto fechado', async () => {
    const errors = await runValidate(
      CreateTransferSchema,
      valid({ paymentMethodDescriptionEnum: 'BITCOIN' }),
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejeita transferDate em formato inválido', async () => {
    const errors = await runValidate(
      CreateTransferSchema,
      valid({ transferDate: '10/06/2026' }),
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejeita props desconhecidas', async () => {
    const errors = await runValidate(
      CreateTransferSchema,
      valid({ userId: 'hacker' }),
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
