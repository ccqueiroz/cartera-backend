import { PaymentMethodOutput } from '@/features/payment-method/domain/payment-method.entity';
import { PaymentMethodRepository } from '@/features/payment-method/domain/ports/payment-method.repository.port';
import {
  PaymentMethodDescription,
  PaymentMethodDescriptionEnum,
} from '@/features/payment-method/domain/enums/payment-method-description.enum';
import { PaymentMethodNotFoundError } from '@/features/payment-method/domain/errors/payment-method-not-found.error';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const DESCRIPTION_ENUMS = new Set<string>(
  Object.values(PaymentMethodDescriptionEnum),
);

export class GetPaymentMethodByEnumUseCase {
  private constructor(private readonly repository: PaymentMethodRepository) {}

  public static create(
    repository: PaymentMethodRepository,
  ): GetPaymentMethodByEnumUseCase {
    return new GetPaymentMethodByEnumUseCase(repository);
  }

  public async execute(input: {
    descriptionEnum: string;
  }): Promise<PaymentMethodOutput> {
    if (!DESCRIPTION_ENUMS.has(input.descriptionEnum))
      throw new ValidationError(
        ErrorCode.INVALID_PAYMENT_METHOD_DESCRIPTION_ENUM,
      );

    const method = await this.repository.findLatestByEnum(
      input.descriptionEnum as PaymentMethodDescription,
    );
    if (!method) throw new PaymentMethodNotFoundError(input.descriptionEnum);

    return method.toOutput();
  }
}
