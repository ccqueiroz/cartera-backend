import { BusinessRuleViolationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { validatorsPackage } from '@/packages/validators';

export class Phone {
  private constructor(
    public readonly number: string,
    public readonly countryCode: string,
    public readonly isWhatsapp: boolean,
  ) {}

  public static create(input: {
    number: string;
    countryCode: string;
    isWhatsapp: boolean;
  }): Phone {
    if (!input.countryCode.trim())
      throw new BusinessRuleViolationError(ErrorCode.INVALID_PHONE);
    if (!validatorsPackage.phone({ phone: input.number }))
      throw new BusinessRuleViolationError(ErrorCode.INVALID_PHONE);

    return new Phone(input.number, input.countryCode, input.isWhatsapp);
  }
}
