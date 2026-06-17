import { ValidationError } from '../errors/domain.error';
import { ErrorCode } from '../errors/error-code';

/**
 * Posição monetária imutável, normalizada a 2 casas. Irmão de `Money`, mas
 * representa um SALDO: aceita negativo e `subtract` não clampa (CLAUDE.md §7,
 * decisão W2). `Money` segue sendo o tipo de todo valor de operação (≥ 0).
 */
export class SignedMoney {
  private constructor(private readonly _value: number) {}

  public static create(value: number): SignedMoney {
    if (!Number.isFinite(value))
      throw new ValidationError(ErrorCode.MONEY_INVALID_NUMBER);
    return new SignedMoney(SignedMoney.round(value));
  }

  public static zero(): SignedMoney {
    return new SignedMoney(0);
  }

  private static round(value: number): number {
    return Number(value.toFixed(2));
  }

  public get value(): number {
    return this._value;
  }

  public add(other: SignedMoney): SignedMoney {
    return SignedMoney.create(this._value + other._value);
  }

  /** Diferente de `Money`: NÃO clampa — o saldo pode ficar negativo (W2). */
  public subtract(other: SignedMoney): SignedMoney {
    return SignedMoney.create(this._value - other._value);
  }

  public equals(other: SignedMoney): boolean {
    return this._value === other._value;
  }

  public isZero(): boolean {
    return this._value === 0;
  }

  public isNegative(): boolean {
    return this._value < 0;
  }

  public isGreaterThan(other: SignedMoney): boolean {
    return this._value > other._value;
  }

  public format(currency = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(this._value);
  }
}
