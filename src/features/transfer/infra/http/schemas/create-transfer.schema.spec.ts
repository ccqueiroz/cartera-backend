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
  it('accepts a valid payload with transferDate', async () => {
    const errors = await runValidate(
      CreateTransferSchema,
      valid({ transferDate: '2026-06-10' }),
      options,
    );
    expect(errors).toHaveLength(0);
  });

  it('accepts a valid payload without transferDate (optional)', async () => {
    const errors = await runValidate(CreateTransferSchema, valid(), options);
    expect(errors).toHaveLength(0);
  });

  it('rejects an empty fromWalletId', async () => {
    const errors = await runValidate(
      CreateTransferSchema,
      valid({ fromWalletId: '' }),
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects a non-numeric amount', async () => {
    const errors = await runValidate(
      CreateTransferSchema,
      valid({ amount: 'dez' }),
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects a paymentMethodDescriptionEnum outside the closed set', async () => {
    const errors = await runValidate(
      CreateTransferSchema,
      valid({ paymentMethodDescriptionEnum: 'BITCOIN' }),
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects a transferDate in an invalid format', async () => {
    const errors = await runValidate(
      CreateTransferSchema,
      valid({ transferDate: '10/06/2026' }),
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects unknown props', async () => {
    const errors = await runValidate(
      CreateTransferSchema,
      valid({ userId: 'hacker' }),
      options,
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
