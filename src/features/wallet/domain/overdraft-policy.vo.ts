import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import {
  DEFAULT_OVERDRAFT_GRACE_DAYS,
  DEFAULT_OVERDRAFT_MONTHLY_RATE,
} from '@/features/wallet/domain/overdraft-defaults';

export interface OverdraftPolicyPersistence {
  limit: number;
  monthlyRate: number;
  graceDays: number;
  since: string | null;
}

export interface OverdraftPolicyOutput {
  limit: number;
  monthlyRate: number;
  graceDays: number;
  since: string | null;
}

/**
 * Cheque-especial de uma carteira. A ausência da política (`overdraft = null` na
 * `Wallet`) é o caixa puro: sem episódio, sem juros. Quando presente, exige
 * `limit > 0` — não existe "limite 0 com taxa armada".
 */
export class OverdraftPolicy {
  private constructor(
    private readonly _limit: Money,
    private readonly _monthlyRate: number,
    private readonly _graceDays: number,
    private _since: string | null,
  ) {}

  public static create(input: {
    limit?: number;
    monthlyRate?: number;
    graceDays?: number;
    since?: string | null;
  }): OverdraftPolicy {
    if (input.limit === undefined || !(input.limit > 0))
      throw new ValidationError(ErrorCode.OVERDRAFT_LIMIT_REQUIRED);
    const monthlyRate = input.monthlyRate ?? DEFAULT_OVERDRAFT_MONTHLY_RATE;
    const graceDays = input.graceDays ?? DEFAULT_OVERDRAFT_GRACE_DAYS;
    if (monthlyRate < 0 || graceDays < 0)
      throw new ValidationError(ErrorCode.INVALID_OVERDRAFT_CONFIG);
    return new OverdraftPolicy(
      Money.create(input.limit),
      monthlyRate,
      graceDays,
      input.since ?? null,
    );
  }

  public static with(persistence: OverdraftPolicyPersistence): OverdraftPolicy {
    return new OverdraftPolicy(
      Money.create(persistence.limit),
      persistence.monthlyRate,
      persistence.graceDays,
      persistence.since,
    );
  }

  public get limit(): Money {
    return this._limit;
  }

  public get monthlyRate(): number {
    return this._monthlyRate;
  }

  public get graceDays(): number {
    return this._graceDays;
  }

  public get since(): string | null {
    return this._since;
  }

  /** Abre o episódio no 1º cruzamento 0→negativo (W12). */
  public openEpisode(occurredAt: string): void {
    if (this._since === null) this._since = occurredAt;
  }

  public closeEpisode(): void {
    this._since = null;
  }

  /** Reinicia o relógio após capitalizar (os juros viraram principal). */
  public restartEpisode(occurredAt: string): void {
    this._since = occurredAt;
  }

  public toPersistence(): OverdraftPolicyPersistence {
    return {
      limit: this._limit.value,
      monthlyRate: this._monthlyRate,
      graceDays: this._graceDays,
      since: this._since,
    };
  }
}
