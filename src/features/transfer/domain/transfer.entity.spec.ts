import { Transfer } from './transfer.entity';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

function codeOf(action: () => unknown): ErrorCode | undefined {
  try {
    action();
    return undefined;
  } catch (error) {
    return (error as ValidationError).code;
  }
}

function base(overrides: Partial<Parameters<typeof Transfer.create>[0]> = {}) {
  return Transfer.create({
    id: 't1',
    userId: 'u1',
    fromWalletId: 'w1',
    toWalletId: 'w2',
    amount: Money.create(100),
    paymentMethodDescriptionEnum: 'PIX',
    transferDate: '2026-06-10',
    createdAt: '2026-06-17T10:00:00.000Z',
    ...overrides,
  });
}

describe('Transfer entity', () => {
  it('cria uma transferência válida e serializa puro', () => {
    const transfer = base();
    const persistence = transfer.toPersistence();
    const output = transfer.toOutput();

    expect(persistence.amount).toBe(100);
    expect(persistence.userId).toBe('u1');
    expect(output.fromWalletId).toBe('w1');
    expect(output.toWalletId).toBe('w2');
    expect(output.transferDate).toBe('2026-06-10');
    expect(output).not.toHaveProperty('userId');
    expect(persistence).not.toHaveProperty('updatedAt');
    expect(persistence).not.toHaveProperty('deletedAt');
  });

  it('rejeita origem igual ao destino', () => {
    expect(() => base({ toWalletId: 'w1' })).toThrow(ValidationError);
    expect(codeOf(() => base({ toWalletId: 'w1' }))).toBe(
      ErrorCode.TRANSFER_SAME_WALLET,
    );
  });

  it('rejeita valor zero', () => {
    expect(() => base({ amount: Money.create(0) })).toThrow(ValidationError);
    expect(codeOf(() => base({ amount: Money.create(0) }))).toBe(
      ErrorCode.TRANSFER_AMOUNT_NOT_POSITIVE,
    );
  });

  it('rejeita data futura (depois de hoje)', () => {
    const futura = () =>
      base({
        transferDate: '2026-06-18',
        createdAt: '2026-06-17T10:00:00.000Z',
      });
    expect(futura).toThrow(ValidationError);
    expect(codeOf(futura)).toBe(ErrorCode.TRANSFER_DATE_IN_FUTURE);
  });

  it('aceita data igual a hoje', () => {
    expect(() =>
      base({
        transferDate: '2026-06-17',
        createdAt: '2026-06-17T10:00:00.000Z',
      }),
    ).not.toThrow();
  });

  it('reconstitui de persistência com with()', () => {
    const transfer = Transfer.with({
      id: 't9',
      userId: 'u1',
      fromWalletId: 'w1',
      toWalletId: 'w2',
      amount: 42.5,
      paymentMethodDescriptionEnum: 'CASH',
      transferDate: '2026-05-01',
      createdAt: '2026-05-01T00:00:00.000Z',
    });
    expect(transfer.amount.value).toBe(42.5);
    expect(transfer.id).toBe('t9');
  });
});
