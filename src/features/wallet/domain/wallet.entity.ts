import {
  BusinessRuleViolationError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import { SignedMoney } from '@/shared/kernel/value-objects/signed-money.vo';
import {
  OverdraftPolicy,
  OverdraftPolicyOutput,
  OverdraftPolicyPersistence,
} from '@/features/wallet/domain/overdraft-policy.vo';

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
  isDefault: boolean;
  overdraft: OverdraftPolicy | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface WalletPersistence {
  id: string;
  userId: string;
  name: string;
  balance: number;
  isDefault: boolean;
  overdraft: OverdraftPolicyPersistence | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface WalletOutput {
  id: string;
  name: string;
  balance: number;
  isDefault: boolean;
  effectiveBalance: number;
  overdraftUsed: number;
  overdraftAvailable: number;
  availableBalance: number;
  accruedInterest: number;
  amountToPay: number;
  overdraft: OverdraftPolicyOutput | null;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export class Wallet {
  private constructor(private props: WalletProps) {}

  public static create(input: {
    id: string;
    userId: string;
    name: string;
    balance?: number;
    createdAt: string;
    isDefault?: boolean;
    hasOverdraft?: boolean;
    overdraftLimit?: number;
    overdraftMonthlyRate?: number;
    overdraftGraceDays?: number;
  }): Wallet {
    const overdraft = input.hasOverdraft
      ? OverdraftPolicy.create({
          limit: input.overdraftLimit,
          monthlyRate: input.overdraftMonthlyRate,
          graceDays: input.overdraftGraceDays,
        })
      : null;
    const props: WalletProps = {
      id: input.id,
      userId: input.userId,
      name: input.name.trim(),
      balance: SignedMoney.create(input.balance ?? 0),
      isDefault: input.isDefault ?? false,
      overdraft,
      createdAt: input.createdAt,
      updatedAt: null,
      deletedAt: null,
    };
    Wallet.validateProps(props);
    if (props.overdraft !== null && props.balance.isNegative())
      props.overdraft.openEpisode(input.createdAt.slice(0, 10));
    return new Wallet(props);
  }

  public static with(persistence: WalletPersistence): Wallet {
    return new Wallet({
      ...persistence,
      balance: SignedMoney.create(persistence.balance),
      overdraft: persistence.overdraft
        ? OverdraftPolicy.with(persistence.overdraft)
        : null,
    });
  }

  private static validateProps(props: WalletProps): void {
    if (!props.name.trim())
      throw new ValidationError(ErrorCode.WALLET_NAME_REQUIRED);
  }

  /**
   * Edita nome e liga/desliga o cheque. Numa wallet comum, `hasOverdraft=false`
   * vira caixa puro perdoando o episódio em aberto (a política some, e com ela o
   * `since` e os juros acumulados — decisão do PO). Na default, qualquer mexida
   * no cheque é barrada.
   */
  public edit(input: {
    name?: string;
    updatedAt: string;
    hasOverdraft?: boolean;
    overdraftLimit?: number;
    overdraftMonthlyRate?: number;
    overdraftGraceDays?: number;
  }): void {
    const touchesOverdraft =
      input.hasOverdraft !== undefined ||
      input.overdraftLimit !== undefined ||
      input.overdraftMonthlyRate !== undefined ||
      input.overdraftGraceDays !== undefined;

    if (this.props.isDefault && touchesOverdraft)
      throw new BusinessRuleViolationError(
        ErrorCode.WALLET_DEFAULT_NO_OVERDRAFT,
      );

    let overdraft = this.props.overdraft;
    if (input.hasOverdraft === false) {
      overdraft = null;
    } else if (
      input.hasOverdraft === true ||
      (overdraft !== null && touchesOverdraft)
    ) {
      overdraft = OverdraftPolicy.create({
        limit: input.overdraftLimit ?? overdraft?.limit.value,
        monthlyRate: input.overdraftMonthlyRate ?? overdraft?.monthlyRate,
        graceDays: input.overdraftGraceDays ?? overdraft?.graceDays,
        since: overdraft?.since ?? null,
      });
    }

    const next: WalletProps = {
      ...this.props,
      name: input.name !== undefined ? input.name.trim() : this.props.name,
      overdraft,
      updatedAt: input.updatedAt,
    };
    Wallet.validateProps(next);
    this.props = next;
  }

  /** Debita o caixa; o saldo pode ficar negativo (W2). Abre o episódio só quando há cheque (W12); caixa puro nunca abre. */
  public debit(amount: Money, occurredAt: string, updatedAt: string): void {
    this.props.balance = this.props.balance.subtract(
      SignedMoney.create(amount.value),
    );
    if (this.props.overdraft !== null && this.props.balance.isNegative())
      this.props.overdraft.openEpisode(occurredAt);
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
    if (this.props.overdraft !== null && !this.props.balance.isNegative())
      this.props.overdraft.closeEpisode();
  }

  /**
   * Reinicia o relógio do episódio após capitalizar juros: os juros viraram
   * principal, então o accrual seguinte conta a partir de `occurredAt` (evita
   * recontar os juros já capitalizados no replay).
   */
  public restartOverdraftEpisode(occurredAt: string): void {
    if (this.props.overdraft !== null && this.props.balance.isNegative())
      this.props.overdraft.restartEpisode(occurredAt);
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

  public get isDefault(): boolean {
    return this.props.isDefault;
  }

  public get overdraftSince(): string | null {
    return this.props.overdraft?.since ?? null;
  }

  public get overdraftConfig(): OverdraftConfig | null {
    if (this.props.overdraft === null) return null;
    return {
      limit: this.props.overdraft.limit,
      monthlyRate: this.props.overdraft.monthlyRate,
      graceDays: this.props.overdraft.graceDays,
    };
  }

  public get isActive(): boolean {
    return this.props.deletedAt === null;
  }

  /** Quanto do cheque o débito ultrapassaria: saldo final < −(limite) (W11, warn-only). Caixa puro nunca estoura. */
  public exceedsOverdraftLimit(): boolean {
    if (this.props.overdraft === null) return false;
    return this.props.balance.value < -this.props.overdraft.limit.value;
  }

  public toPersistence(): WalletPersistence {
    return {
      id: this.props.id,
      userId: this.props.userId,
      name: this.props.name,
      balance: this.props.balance.value,
      isDefault: this.props.isDefault,
      overdraft: this.props.overdraft?.toPersistence() ?? null,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      deletedAt: this.props.deletedAt,
    };
  }

  public toOutput(accruedInterest = 0): WalletOutput {
    const balance = this.props.balance.value;
    const limit = this.props.overdraft?.limit.value ?? 0;
    const effectiveBalance = Math.max(0, balance);
    const overdraftUsed = Math.max(0, -balance);
    const overdraftAvailable = Math.max(0, limit - overdraftUsed);
    const availableBalance = Number((balance + limit).toFixed(2));
    const amountToPay = Number((overdraftUsed + accruedInterest).toFixed(2));
    return {
      id: this.props.id,
      name: this.props.name,
      balance,
      isDefault: this.props.isDefault,
      effectiveBalance,
      overdraftUsed,
      overdraftAvailable,
      availableBalance,
      accruedInterest,
      amountToPay,
      overdraft: this.props.overdraft
        ? {
            limit,
            monthlyRate: this.props.overdraft.monthlyRate,
            graceDays: this.props.overdraft.graceDays,
            since: this.props.overdraft.since,
          }
        : null,
      active: this.isActive,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
