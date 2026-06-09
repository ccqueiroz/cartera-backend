import { ValidationError } from '../errors/domain.error';
import { ErrorCode } from '../errors/error-code';

/**
 * Valor monetário imutável, normalizado a 2 casas. Toda aritmética financeira
 * passa por aqui (CLAUDE.md §7) — nunca em repositório.
 */
export class Money {
  private constructor(private readonly _value: number) {}

  public static create(value: number): Money {
    if (!Number.isFinite(value))
      throw new ValidationError(ErrorCode.MONEY_INVALID_NUMBER);
    if (value < 0) throw new ValidationError(ErrorCode.MONEY_NEGATIVE);
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

  /**
   * Distribui o valor em fatias proporcionais aos pesos, conservando o total
   * exatamente (Σ fatias = valor). O resto de centavos é repartido por
   * largest-remainder (Hamilton): cada fatia recebe o piso, depois +1 centavo
   * para os maiores restos até fechar o total. Função pura.
   */
  public allocate(ratios: number[]): Money[] {
    if (ratios.length === 0) return [];

    const totalCents = Math.round(this._value * 100);
    const totalWeight = ratios.reduce((sum, weight) => sum + weight, 0);

    if (totalWeight <= 0)
      // pesos todos nulos: sem proporção; deposita o total na primeira fatia
      return ratios.map((_, index) =>
        index === 0 ? new Money(Money.round(totalCents / 100)) : new Money(0),
      );

    const exactShares = ratios.map(
      (weight) => (totalCents * weight) / totalWeight,
    );
    const floors = exactShares.map((share) => Math.floor(share));
    let leftover = totalCents - floors.reduce((sum, cents) => sum + cents, 0);

    const byRemainderDesc = ratios
      .map((_, index) => index)
      .sort(
        (a, b) => exactShares[b] - floors[b] - (exactShares[a] - floors[a]),
      );

    const cents = [...floors];
    for (const index of byRemainderDesc) {
      if (leftover <= 0) break;
      cents[index] += 1;
      leftover -= 1;
    }

    return cents.map((value) => new Money(Money.round(value / 100)));
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
