import { PaymentMethod } from '@/features/payment-method/domain/payment-method.entity';
import { PaymentMethodRepository } from '@/features/payment-method/domain/ports/payment-method.repository.port';
import { PaymentMethodNotFoundError } from '@/features/payment-method/domain/errors/payment-method-not-found.error';
import { PaymentMethodDescription } from '@/features/payment-method/domain/enums/payment-method-description.enum';

interface UpdatePaymentMethodInput {
  descriptionEnum: PaymentMethodDescription;
  description: string;
}

export class UpdatePaymentMethodUseCase {
  private constructor(
    private readonly repository: PaymentMethodRepository,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: PaymentMethodRepository,
    now: () => string,
  ): UpdatePaymentMethodUseCase {
    return new UpdatePaymentMethodUseCase(repository, now);
  }

  public async execute(
    input: UpdatePaymentMethodInput,
  ): Promise<PaymentMethod> {
    const method = await this.repository.findActiveByEnum(
      input.descriptionEnum,
    );
    if (!method) throw new PaymentMethodNotFoundError(input.descriptionEnum);

    method.updateDescription(input.description, this.now());
    await this.repository.update(method);
    return method;
  }
}
