import { ValidationError } from '../errors/domain.error';

/**
 * Valor monetário imutável, normalizado a 2 casas. Toda aritmética financeira
 * passa por aqui (CLAUDE.md §7) — nunca em repositório.
 */
export class Money {
  private constructor(private readonly _value: number) {}

  public static create(value: number): Money {
    if (!Number.isFinite(value))
      throw new ValidationError('Money must be a finite number');
    if (value < 0) throw new ValidationError('Money cannot be negative');
    return new Money(Money.round(value));
  }

  public static zero(): Money {
    return new Money(0);
  }

  private static round(value: number): number {
    return Number(value.toFixed(2));
  }

  public get value(): number {
    return this._value;
  }

  public add(other: Money): Money {
    return Money.create(this._value + other._value);
  }

  /** Não permite resultado negativo (clampa em zero). */
  public subtract(other: Money): Money {
    return Money.create(Math.max(0, this._value - other._value));
  }

  public multiply(factor: number): Money {
    return Money.create(this._value * factor);
  }

  public equals(other: Money): boolean {
    return this._value === other._value;
  }

  public isZero(): boolean {
    return this._value === 0;
  }

  public isGreaterThan(other: Money): boolean {
    return this._value > other._value;
  }

  public format(currency = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(this._value);
  }
}
