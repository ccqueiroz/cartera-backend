import { WalletSnapshot } from './wallet-snapshot';
import { Money } from '@/shared/kernel/value-objects/money.vo';

const cashRaw = {
  userId: 'u1',
  balance: 0,
  overdraft: null,
  deletedAt: null,
};

const overdraftRaw = {
  userId: 'u1',
  balance: 0,
  overdraft: { limit: 100, monthlyRate: 0.08, graceDays: 0, since: null },
  deletedAt: null,
};

describe('WalletSnapshot (settle)', () => {
  it('pure cash debit goes negative without opening an episode or exceeding a limit', () => {
    const snapshot = WalletSnapshot.fromRaw('w1', { ...cashRaw });
    snapshot.debit(Money.create(150), '2026-06-14');
    expect(snapshot.balance.value).toBe(-150);
    expect(snapshot.isNegative()).toBe(true);
    expect(snapshot.exceedsOverdraftLimit()).toBe(false);
    const persisted = snapshot.toPersistence('2026-06-14T01:00:00.000Z');
    expect(persisted.overdraft).toBeNull();
    expect(persisted.balance).toBe(-150);
  });

  it('overdraft wallet debit opens the episode and can exceed the limit', () => {
    const snapshot = WalletSnapshot.fromRaw('w1', { ...overdraftRaw });
    snapshot.debit(Money.create(150), '2026-06-14');
    expect(snapshot.exceedsOverdraftLimit()).toBe(true);
    const persisted = snapshot.toPersistence('2026-06-14T01:00:00.000Z') as {
      overdraft: { since: string | null };
    };
    expect(persisted.overdraft.since).toBe('2026-06-14');
  });
});
