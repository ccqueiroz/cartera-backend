import { AtomicContext, AtomicRunner } from '@/shared/database/atomic-runner';
import {
  WalletMovementSpec,
  SettlementMovementRef,
  SettlementWallet,
  WalletGateway,
  WalletTxContext,
} from '@/features/core-finance/shared/ports/wallet.gateway.port';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { SignedMoney } from '@/shared/kernel/value-objects/signed-money.vo';

/** Satisfies the port wallet without importing the wallet feature, which core-finance never imports. */
export class TestWallet implements SettlementWallet {
  public occurredAt?: string;
  public updatedAt?: string;

  constructor(
    public readonly id: string,
    public balance: SignedMoney,
    private readonly overdraftLimit = 0,
  ) {}

  public debit(amount: Money, occurredAt: string, updatedAt: string): void {
    this.balance = this.balance.subtract(SignedMoney.create(amount.value));
    this.occurredAt = occurredAt;
    this.updatedAt = updatedAt;
  }

  public credit(amount: Money, updatedAt: string): void {
    this.balance = this.balance.add(SignedMoney.create(amount.value));
    this.updatedAt = updatedAt;
  }

  public closeOverdraftEpisode(): void {
    // The overdraft episode belongs to the wallet entity; no coordinator spec asserts it.
  }

  public exceedsOverdraftLimit(): boolean {
    return this.overdraftLimit > 0 && this.balance.value < -this.overdraftLimit;
  }
}

export class FakeWalletGateway implements WalletGateway {
  public readonly movements: WalletMovementSpec[] = [];
  /** The dates the last saved wallet received from its debit or credit. */
  public savedDates: { occurredAt?: string; updatedAt?: string } = {};
  public balance: number;

  constructor(
    private readonly walletId: string,
    initialBalance: number,
    private readonly overdraftLimit = 0,
  ) {
    this.balance = initialBalance;
  }

  public async loadWalletTx(
    _ctx: WalletTxContext,
    walletId: string,
  ): Promise<SettlementWallet | null> {
    if (walletId !== this.walletId) return null;
    return new TestWallet(
      walletId,
      SignedMoney.create(this.balance),
      this.overdraftLimit,
    );
  }

  public async findLatestSettlementTx(
    _ctx: WalletTxContext,
    leafId: string,
  ): Promise<SettlementMovementRef | null> {
    const latest = this.movements
      .filter((m) => m.refId === leafId && m.refType === 'SETTLEMENT')
      .pop();
    return latest ? { walletId: latest.walletId, amount: latest.amount } : null;
  }

  public async saveWalletTx(
    _ctx: WalletTxContext,
    wallet: SettlementWallet,
    movements: WalletMovementSpec[],
  ): Promise<void> {
    const { occurredAt, updatedAt } = wallet as TestWallet;
    this.savedDates = { occurredAt, updatedAt };
    this.balance = wallet.balance.value;
    this.movements.push(...movements);
  }
}

/** Runs the work twice and drops the wallet writes of the first run, as a Firestore retry does. */
export function retryingRunner(wallet: FakeWalletGateway): AtomicRunner {
  return {
    run: async <T>(work: (ctx: AtomicContext) => Promise<T>): Promise<T> => {
      const { balance } = wallet;
      const written = wallet.movements.length;
      await work({ txn: {} } as AtomicContext);
      wallet.balance = balance;
      wallet.movements.splice(written);
      return work({ txn: {} } as AtomicContext);
    },
  } as AtomicRunner;
}
