import { TransferWalletSnapshot } from './transfer-wallet-snapshot';
import { Money } from '@/shared/kernel/value-objects/money.vo';

describe('TransferWalletSnapshot', () => {
  it('pure cash debit goes negative without opening an episode', () => {
    const snapshot = TransferWalletSnapshot.fromRaw({
      userId: 'u1',
      balance: 0,
      overdraft: null,
      deletedAt: null,
    });
    snapshot.debit(Money.create(80), '2026-06-14');
    expect(snapshot.balance.value).toBe(-80);
    expect(snapshot.exceedsOverdraftLimit()).toBe(false);
    expect(
      snapshot.toPersistence('2026-06-14T01:00:00.000Z').overdraft,
    ).toBeNull();
  });

  it('overdraft wallet debit opens the episode', () => {
    const snapshot = TransferWalletSnapshot.fromRaw({
      userId: 'u1',
      balance: 0,
      overdraft: { limit: 100, monthlyRate: 0.08, graceDays: 0, since: null },
      deletedAt: null,
    });
    snapshot.debit(Money.create(50), '2026-06-14');
    const persisted = snapshot.toPersistence('2026-06-14T01:00:00.000Z') as {
      overdraft: { since: string | null };
    };
    expect(persisted.overdraft.since).toBe('2026-06-14');
  });
});
