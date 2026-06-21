import { Money } from '@/shared/kernel/value-objects/money.vo';
import { SignedMoney } from '@/shared/kernel/value-objects/signed-money.vo';

/**
 * Estado puro da carteira que a liquidação de core-finance precisa para
 * debitar/creditar e emitir os warnings de saldo, sem importar a entidade
 * `Wallet` (fronteira de feature — wallet é outra feature, regra §4.1). Espelha o
 * `TransferWalletSnapshot`: o gateway carrega o registro cru completo (`raw`) para
 * que a escrita atômica devolva a carteira intacta, mutando só saldo/episódio/updatedAt.
 */
export class WalletSnapshot {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    private _balance: SignedMoney,
    private readonly overdraftLimit: Money,
    private _overdraftSince: string | null,
    private readonly raw: Record<string, unknown>,
  ) {}

  public static fromRaw(
    id: string,
    raw: {
      userId: string;
      balance: number;
      overdraftLimit: number;
      overdraftSince: string | null;
      [key: string]: unknown;
    },
  ): WalletSnapshot {
    return new WalletSnapshot(
      id,
      raw.userId,
      SignedMoney.create(raw.balance),
      Money.create(raw.overdraftLimit),
      raw.overdraftSince,
      raw,
    );
  }

  public get balance(): SignedMoney {
    return this._balance;
  }

  /** Debita o caixa; o saldo pode ficar negativo (W2). Abre o episódio no 1º cruzamento 0→negativo (W12). */
  public debit(amount: Money, occurredAt: string): void {
    this._balance = this._balance.subtract(SignedMoney.create(amount.value));
    if (this._balance.isNegative() && this._overdraftSince === null)
      this._overdraftSince = occurredAt;
  }

  public credit(amount: Money): void {
    this._balance = this._balance.add(SignedMoney.create(amount.value));
    if (!this._balance.isNegative()) this._overdraftSince = null;
  }

  public isNegative(): boolean {
    return this._balance.isNegative();
  }

  public exceedsOverdraftLimit(): boolean {
    return this._balance.value < -this.overdraftLimit.value;
  }

  public toPersistence(updatedAt: string): Record<string, unknown> {
    return {
      ...this.raw,
      balance: this._balance.value,
      overdraftSince: this._overdraftSince,
      updatedAt,
    };
  }
}
