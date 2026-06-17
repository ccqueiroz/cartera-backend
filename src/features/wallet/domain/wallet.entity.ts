import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { SignedMoney } from '@/shared/kernel/value-objects/signed-money.vo';
import {
  DEFAULT_OVERDRAFT_GRACE_DAYS,
  DEFAULT_OVERDRAFT_MONTHLY_RATE,
} from '@/features/wallet/domain/overdraft-defaults';

export interface OverdraftConfig {
  limit: Money;
  monthlyRate: number;
  graceDays: number;
}

interface WalletProps {
  id: string;
  userId: string;
  name: string;
  balance: SignedMoney;
  overdraftLimit: Money;
  overdraftMonthlyRate: number;
  overdraftGraceDays: number;
  overdraftSince: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface WalletPersistence {
  id: string;
  userId: string;
  name: string;
  balance: number;
  overdraftLimit: number;
  overdraftMonthlyRate: number;
  overdraftGraceDays: number;
  overdraftSince: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface WalletOutput {
  id: string;
  name: string;
  balance: number;
  effectiveBalance: number;
  overdraftUsed: number;
  overdraftAvailable: number;
  availableBalance: number;
  accruedInterest: number;
  amountToPay: number;
  overdraftLimit: number;
  overdraftMonthlyRate: number;
  overdraftGraceDays: number;
  overdraftSince: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
}

interface OverdraftInput {
  overdraftLimit?: number;
  overdraftMonthlyRate?: number;
  overdraftGraceDays?: number;
}

export class Wallet {
  private constructor(private props: WalletProps) {}

  public static create(input: {
    id: string;
    userId: string;
    name: string;
    balance?: number;
    createdAt: string;
    overdraftLimit?: number;
    overdraftMonthlyRate?: number;
    overdraftGraceDays?: number;
    overdraftSince?: string | null;
  }): Wallet {
    const overdraft = Wallet.resolveOverdraft(input);
    const props: WalletProps = {
      id: input.id,
      userId: input.userId,
      name: input.name.trim(),
      balance: SignedMoney.create(input.balance ?? 0),
      overdraftLimit: overdraft.limit,
      overdraftMonthlyRate: overdraft.monthlyRate,
      overdraftGraceDays: overdraft.graceDays,
      overdraftSince: input.overdraftSince ?? null,
      createdAt: input.createdAt,
      updatedAt: null,
      deletedAt: null,
    };
    Wallet.validateProps(props);
    return new Wallet(props);
  }

  public static with(persistence: WalletPersistence): Wallet {
    return new Wallet({
      ...persistence,
      balance: SignedMoney.create(persistence.balance),
      overdraftLimit: Money.create(persistence.overdraftLimit),
    });
  }

  private static resolveOverdraft(input: OverdraftInput): OverdraftConfig {
    Wallet.assertNonNegativeConfig(input);
    return {
      limit: Money.create(input.overdraftLimit ?? 0),
      monthlyRate: input.overdraftMonthlyRate ?? DEFAULT_OVERDRAFT_MONTHLY_RATE,
      graceDays: input.overdraftGraceDays ?? DEFAULT_OVERDRAFT_GRACE_DAYS,
    };
  }

  private static assertNonNegativeConfig(input: OverdraftInput): void {
    const values = [
      input.overdraftLimit,
      input.overdraftMonthlyRate,
      input.overdraftGraceDays,
    ];
    if (values.some((value) => value !== undefined && value < 0))
      throw new ValidationError(ErrorCode.INVALID_OVERDRAFT_CONFIG);
  }

  private static validateProps(props: WalletProps): void {
    if (!props.name.trim())
      throw new ValidationError(ErrorCode.WALLET_NAME_REQUIRED);
  }

  public edit(input: {
    name?: string;
    updatedAt: string;
    overdraftLimit?: number;
    overdraftMonthlyRate?: number;
    overdraftGraceDays?: number;
  }): void {
    Wallet.assertNonNegativeConfig(input);
    const next: WalletProps = {
      ...this.props,
      name: input.name !== undefined ? input.name.trim() : this.props.name,
      overdraftLimit:
        input.overdraftLimit !== undefined
          ? Money.create(input.overdraftLimit)
          : this.props.overdraftLimit,
      overdraftMonthlyRate:
        input.overdraftMonthlyRate ?? this.props.overdraftMonthlyRate,
      overdraftGraceDays:
        input.overdraftGraceDays ?? this.props.overdraftGraceDays,
      updatedAt: input.updatedAt,
    };
    Wallet.validateProps(next);
    this.props = next;
  }

  /** Debita o caixa; o saldo pode ficar negativo (W2). Abre o episódio de cheque no 1º cruzamento 0→negativo (W12). */
  public debit(amount: Money, occurredAt: string, updatedAt: string): void {
    this.props.balance = this.props.balance.subtract(
      SignedMoney.create(amount.value),
    );
    if (this.props.balance.isNegative() && this.props.overdraftSince === null)
      this.props.overdraftSince = occurredAt;
    this.props.updatedAt = updatedAt;
  }

  /** Credita o caixa (entrada). O fechamento do episódio é decidido pelo caso de uso após capitalizar os juros. */
  public credit(amount: Money, updatedAt: string): void {
    this.props.balance = this.props.balance.add(
      SignedMoney.create(amount.value),
    );
    this.props.updatedAt = updatedAt;
  }

  /** Fecha o episódio quando o saldo voltou a ≥ 0 e os juros foram quitados (W12). */
  public closeOverdraftEpisode(): void {
    if (!this.props.balance.isNegative()) this.props.overdraftSince = null;
  }

  /**
   * Reinicia o relógio do episódio após capitalizar juros: os juros viraram
   * principal, então o accrual seguinte conta a partir de `occurredAt` (evita
   * recontar os juros já capitalizados no replay).
   */
  public restartOverdraftEpisode(occurredAt: string): void {
    if (this.props.balance.isNegative()) this.props.overdraftSince = occurredAt;
  }

  public softDelete(deletedAt: string): void {
    this.props.deletedAt = deletedAt;
    this.props.updatedAt = deletedAt;
  }

  public get id(): string {
    return this.props.id;
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get balance(): SignedMoney {
    return this.props.balance;
  }

  public get overdraftSince(): string | null {
    return this.props.overdraftSince;
  }

  public get overdraftConfig(): OverdraftConfig {
    return {
      limit: this.props.overdraftLimit,
      monthlyRate: this.props.overdraftMonthlyRate,
      graceDays: this.props.overdraftGraceDays,
    };
  }

  public get isActive(): boolean {
    return this.props.deletedAt === null;
  }

  /** Quanto do cheque o débito ultrapassaria: saldo final < −(limite) (W11, warn-only). */
  public exceedsOverdraftLimit(): boolean {
    const limit = this.props.overdraftLimit.value;
    return this.props.balance.value < -limit;
  }

  public toPersistence(): WalletPersistence {
    return {
      id: this.props.id,
      userId: this.props.userId,
      name: this.props.name,
      balance: this.props.balance.value,
      overdraftLimit: this.props.overdraftLimit.value,
      overdraftMonthlyRate: this.props.overdraftMonthlyRate,
      overdraftGraceDays: this.props.overdraftGraceDays,
      overdraftSince: this.props.overdraftSince,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      deletedAt: this.props.deletedAt,
    };
  }

  public toOutput(accruedInterest = 0): WalletOutput {
    const balance = this.props.balance.value;
    const limit = this.props.overdraftLimit.value;
    const effectiveBalance = Math.max(0, balance);
    const overdraftUsed = Math.max(0, -balance);
    const overdraftAvailable = Math.max(0, limit - overdraftUsed);
    const availableBalance = Number((balance + limit).toFixed(2));
    const amountToPay = Number((overdraftUsed + accruedInterest).toFixed(2));
    return {
      id: this.props.id,
      name: this.props.name,
      balance,
      effectiveBalance,
      overdraftUsed,
      overdraftAvailable,
      availableBalance,
      accruedInterest,
      amountToPay,
      overdraftLimit: limit,
      overdraftMonthlyRate: this.props.overdraftMonthlyRate,
      overdraftGraceDays: this.props.overdraftGraceDays,
      overdraftSince: this.props.overdraftSince,
      active: this.isActive,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
