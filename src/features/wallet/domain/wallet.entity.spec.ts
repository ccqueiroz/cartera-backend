import { Wallet } from './wallet.entity';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

function build(overrides: Partial<Parameters<typeof Wallet.create>[0]> = {}) {
  return Wallet.create({
    id: 'w1',
    userId: 'u1',
    name: 'Nubank',
    createdAt: '2026-06-14T00:00:00.000Z',
    ...overrides,
  });
}

function captureError(fn: () => unknown): unknown {
  try {
    fn();
    return undefined;
  } catch (error) {
    return error;
  }
}

describe('Wallet entity', () => {
  it('cria com defaults de cheque (taxa 0.08, grace 0, limite 0) e sem campo de IOF', () => {
    const wallet = build();
    const out = wallet.toOutput();
    expect(out.balance).toBe(0);
    expect(out.overdraftLimit).toBe(0);
    expect(out.overdraftMonthlyRate).toBe(0.08);
    expect(out.overdraftGraceDays).toBe(0);
    expect(out.overdraftSince).toBeNull();
    expect(
      (out as unknown as Record<string, unknown>).overdraftIofDailyRate,
    ).toBeUndefined();
  });

  it('rejeita nome vazio', () => {
    expect(() => build({ name: '   ' })).toThrow(ValidationError);
    const thrown = captureError(() => build({ name: '' }));
    expect(thrown).toBeInstanceOf(ValidationError);
    expect((thrown as ValidationError).code).toBe(
      ErrorCode.WALLET_NAME_REQUIRED,
    );
  });

  it('rejeita config de cheque negativa', () => {
    expect(() => build({ overdraftLimit: -1 })).toThrow(ValidationError);
    expect(() => build({ overdraftMonthlyRate: -0.1 })).toThrow(
      ValidationError,
    );
    expect(() => build({ overdraftGraceDays: -2 })).toThrow(ValidationError);
  });

  it('debita podendo negativar e abre o episódio no 1º cruzamento 0→negativo', () => {
    const wallet = build({ overdraftLimit: 100 });
    wallet.debit(Money.create(150), '2026-06-14', '2026-06-14T01:00:00.000Z');
    expect(wallet.balance.value).toBe(-150);
    expect(wallet.overdraftSince).toBe('2026-06-14');
    expect(wallet.exceedsOverdraftLimit()).toBe(true);
  });

  it('não reabre episódio já aberto num segundo débito', () => {
    const wallet = build();
    wallet.debit(Money.create(50), '2026-06-14', '2026-06-14T01:00:00.000Z');
    wallet.debit(Money.create(50), '2026-06-15', '2026-06-15T01:00:00.000Z');
    expect(wallet.overdraftSince).toBe('2026-06-14');
    expect(wallet.balance.value).toBe(-100);
  });

  it('credita e fecha o episódio quando o saldo volta a ≥ 0', () => {
    const wallet = build();
    wallet.debit(Money.create(100), '2026-06-14', '2026-06-14T01:00:00.000Z');
    wallet.credit(Money.create(120), '2026-06-16T01:00:00.000Z');
    wallet.closeOverdraftEpisode();
    expect(wallet.balance.value).toBe(20);
    expect(wallet.overdraftSince).toBeNull();
  });

  it('edit aplica whitelist (name + config), nunca balance', () => {
    const wallet = build({ balance: 500 });
    wallet.edit({
      name: 'Itaú',
      overdraftLimit: 300,
      updatedAt: '2026-06-15T00:00:00.000Z',
    });
    const out = wallet.toOutput();
    expect(out.name).toBe('Itaú');
    expect(out.overdraftLimit).toBe(300);
    expect(out.balance).toBe(500);
  });

  it('discrimina efetivo × cheque na saída', () => {
    const wallet = build({ overdraftLimit: 100 });
    wallet.debit(Money.create(100), '2026-06-14', '2026-06-14T01:00:00.000Z');
    const out = wallet.toOutput(5);
    expect(out.balance).toBe(-100);
    expect(out.effectiveBalance).toBe(0);
    expect(out.overdraftUsed).toBe(100);
    expect(out.overdraftAvailable).toBe(0);
    expect(out.availableBalance).toBe(0);
    expect(out.accruedInterest).toBe(5);
    expect(out.amountToPay).toBe(105);
  });

  it('round-trip de persistência preserva sinal negativo', () => {
    const wallet = build({ balance: -42.5, overdraftLimit: 100 });
    const persisted = wallet.toPersistence();
    expect(persisted.balance).toBe(-42.5);
    const restored = Wallet.with(persisted);
    expect(restored.balance.value).toBe(-42.5);
  });
});
