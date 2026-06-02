import { ValidationError } from '../errors/domain.error';
import { ErrorCode } from '../errors/error-code';

/** Intervalo de datas imutável [inicial, final]. */
export class DateRange {
  private constructor(
    private readonly _initialDate: Date,
    private readonly _finalDate: Date,
  ) {}

  public static create(initialDate: Date, finalDate: Date): DateRange {
    if (initialDate.getTime() > finalDate.getTime()) {
      throw new ValidationError(ErrorCode.INVALID_DATE_RANGE);
    }
    return new DateRange(new Date(initialDate), new Date(finalDate));
  }

  public get initialDate(): Date {
    return new Date(this._initialDate);
  }

  public get finalDate(): Date {
    return new Date(this._finalDate);
  }

  public contains(date: Date): boolean {
    const t = date.getTime();
    return t >= this._initialDate.getTime() && t <= this._finalDate.getTime();
  }
}
