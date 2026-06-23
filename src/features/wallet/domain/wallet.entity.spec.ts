import { Wallet } from './wallet.entity';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import {
  BusinessRuleViolationError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
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
  it('is pure cash by default (no overdraft policy, not default)', () => {
    const wallet = build();
    const out = wallet.toOutput();
    expect(out.balance).toBe(0);
    expect(out.isDefault).toBe(false);
    expect(out.overdraft).toBeNull();
    expect(wallet.overdraftConfig).toBeNull();
  });

  it('builds an overdraft policy when hasOverdraft with a positive limit', () => {
    const wallet = build({ hasOverdraft: true, overdraftLimit: 300 });
    const out = wallet.toOutput();
    expect(out.overdraft).toEqual({
      limit: 300,
      monthlyRate: 0.08,
      graceDays: 0,
      since: null,
    });
  });

  it('rejects overdraft without a positive limit', () => {
    const thrown = captureError(() => build({ hasOverdraft: true }));
    expect(thrown).toBeInstanceOf(ValidationError);
    expect((thrown as ValidationError).code).toBe(
      ErrorCode.OVERDRAFT_LIMIT_REQUIRED,
    );
    expect(() => build({ hasOverdraft: true, overdraftLimit: 0 })).toThrow(
      ValidationError,
    );
  });

  it('rejects empty name', () => {
    expect(() => build({ name: '   ' })).toThrow(ValidationError);
    const thrown = captureError(() => build({ name: '' }));
    expect((thrown as ValidationError).code).toBe(
      ErrorCode.WALLET_NAME_REQUIRED,
    );
  });

  it('rejects negative overdraft config', () => {
    expect(() =>
      build({
        hasOverdraft: true,
        overdraftLimit: 100,
        overdraftMonthlyRate: -0.1,
      }),
    ).toThrow(ValidationError);
    expect(() =>
      build({
        hasOverdraft: true,
        overdraftLimit: 100,
        overdraftGraceDays: -2,
      }),
    ).toThrow(ValidationError);
  });

  it('pure cash debit goes negative WITHOUT opening an episode', () => {
    const wallet = build();
    wallet.debit(Money.create(150), '2026-06-14', '2026-06-14T01:00:00.000Z');
    expect(wallet.balance.value).toBe(-150);
    expect(wallet.overdraftSince).toBeNull();
    expect(wallet.exceedsOverdraftLimit()).toBe(false);
  });

  it('overdraft wallet debit opens the episode on the first 0→negative crossing', () => {
    const wallet = build({ hasOverdraft: true, overdraftLimit: 100 });
    wallet.debit(Money.create(150), '2026-06-14', '2026-06-14T01:00:00.000Z');
    expect(wallet.balance.value).toBe(-150);
    expect(wallet.overdraftSince).toBe('2026-06-14');
    expect(wallet.exceedsOverdraftLimit()).toBe(true);
  });

  it('does not reopen an already-open episode on a second debit', () => {
    const wallet = build({ hasOverdraft: true, overdraftLimit: 100 });
    wallet.debit(Money.create(50), '2026-06-14', '2026-06-14T01:00:00.000Z');
    wallet.debit(Money.create(50), '2026-06-15', '2026-06-15T01:00:00.000Z');
    expect(wallet.overdraftSince).toBe('2026-06-14');
    expect(wallet.balance.value).toBe(-100);
  });

  it('credits and closes the episode when balance returns to ≥ 0', () => {
    const wallet = build({ hasOverdraft: true, overdraftLimit: 100 });
    wallet.debit(Money.create(100), '2026-06-14', '2026-06-14T01:00:00.000Z');
    wallet.credit(Money.create(120), '2026-06-16T01:00:00.000Z');
    wallet.closeOverdraftEpisode();
    expect(wallet.balance.value).toBe(20);
    expect(wallet.overdraftSince).toBeNull();
  });

  it('edit enables overdraft on a common wallet', () => {
    const wallet = build();
    wallet.edit({
      hasOverdraft: true,
      overdraftLimit: 200,
      updatedAt: '2026-06-15T00:00:00.000Z',
    });
    expect(wallet.toOutput().overdraft?.limit).toBe(200);
  });

  it('edit disables overdraft, forgiving the open episode and keeping the negative balance', () => {
    const wallet = build({ hasOverdraft: true, overdraftLimit: 200 });
    wallet.debit(Money.create(150), '2026-06-14', '2026-06-14T01:00:00.000Z');
    expect(wallet.overdraftSince).toBe('2026-06-14');
    wallet.edit({ hasOverdraft: false, updatedAt: '2026-06-15T00:00:00.000Z' });
    expect(wallet.toOutput().overdraft).toBeNull();
    expect(wallet.overdraftSince).toBeNull();
    expect(wallet.balance.value).toBe(-150);
  });

  it('edit rejects overdraft changes on the default wallet', () => {
    const wallet = build({ isDefault: true });
    const thrown = captureError(() =>
      wallet.edit({
        hasOverdraft: true,
        overdraftLimit: 100,
        updatedAt: '2026-06-15T00:00:00.000Z',
      }),
    );
    expect(thrown).toBeInstanceOf(BusinessRuleViolationError);
    expect((thrown as BusinessRuleViolationError).code).toBe(
      ErrorCode.WALLET_DEFAULT_NO_OVERDRAFT,
    );
  });

  it('edit allows renaming the default wallet, overdraft stays null', () => {
    const wallet = build({ isDefault: true });
    wallet.edit({
      name: 'Minha Cartera',
      updatedAt: '2026-06-15T00:00:00.000Z',
    });
    const out = wallet.toOutput();
    expect(out.name).toBe('Minha Cartera');
    expect(out.overdraft).toBeNull();
  });

  it('edit applies the whitelist (name), never balance', () => {
    const wallet = build({ balance: 500 });
    wallet.edit({ name: 'Itaú', updatedAt: '2026-06-15T00:00:00.000Z' });
    const out = wallet.toOutput();
    expect(out.name).toBe('Itaú');
    expect(out.balance).toBe(500);
  });

  it('derives effective vs overdraft fields for an overdraft wallet', () => {
    const wallet = build({ hasOverdraft: true, overdraftLimit: 100 });
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

  it('derives availability for pure cash (no overdraft headroom)', () => {
    const wallet = build();
    wallet.debit(Money.create(40), '2026-06-14', '2026-06-14T01:00:00.000Z');
    const out = wallet.toOutput();
    expect(out.overdraftUsed).toBe(40);
    expect(out.overdraftAvailable).toBe(0);
    expect(out.availableBalance).toBe(-40);
    expect(out.accruedInterest).toBe(0);
    expect(out.amountToPay).toBe(40);
  });

  it('persistence round-trip preserves negative sign, isDefault and overdraft shape', () => {
    const wallet = build({
      balance: -42.5,
      hasOverdraft: true,
      overdraftLimit: 100,
    });
    const persisted = wallet.toPersistence();
    expect(persisted.balance).toBe(-42.5);
    expect(persisted.isDefault).toBe(false);
    expect(persisted.overdraft).not.toBeNull();
    const restored = Wallet.with(persisted);
    expect(restored.balance.value).toBe(-42.5);
    expect(restored.overdraftConfig?.limit.value).toBe(100);
  });

  it('persistence round-trip of pure cash keeps overdraft null', () => {
    const wallet = build({ isDefault: true });
    const restored = Wallet.with(wallet.toPersistence());
    expect(restored.isDefault).toBe(true);
    expect(restored.overdraftConfig).toBeNull();
  });
});
