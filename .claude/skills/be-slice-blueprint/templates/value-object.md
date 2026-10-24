# Value object

`domain/<name>.vo.ts` inside the feature when one feature uses it; `src/shared/kernel/value-objects/<name>.vo.ts` when two or more do (promote in the story that brings the second consumer). Immutable: private constructor, `static create()` validates and normalizes, no setters, arithmetic returns a new instance. Errors are kernel classes with a catalog code.

```ts
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const RATE_DECIMALS = 8;

export class Rate {
  private constructor(private readonly _value: number) {}

  public static create(value: number): Rate {
    if (!Number.isFinite(value))
      throw new ValidationError(ErrorCode.RATE_INVALID_NUMBER);
    if (value < 0) throw new ValidationError(ErrorCode.RATE_NEGATIVE);
    return new Rate(Number(value.toFixed(RATE_DECIMALS)));
  }

  public static zero(): Rate {
    return new Rate(0);
  }
  public get value(): number {
    return this._value;
  }
  public applyTo(amount: number): number {
    return Number((amount * this._value).toFixed(2));
  }
  public equals(other: Rate): boolean {
    return this._value === other._value;
  }
  public isZero(): boolean {
    return this._value === 0;
  }
}
```

Existing kernel VOs to reuse before writing one: `Money` (≥ 0, 2 places, `allocate` Hamilton), `SignedMoney` (balance, can be negative), `DateRange`, `PaymentStatus`, `collectBalanceWarnings`. Never add `format()`/`Intl` to a VO (the backend never formats).
