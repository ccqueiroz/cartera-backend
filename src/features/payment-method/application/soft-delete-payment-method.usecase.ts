import { PaymentMethodRepository } from '@/features/payment-method/domain/ports/payment-method.repository.port';
import { PaymentMethodNotFoundError } from '@/features/payment-method/domain/errors/payment-method-not-found.error';
import { PaymentMethodDescription } from '@/features/payment-method/domain/enums/payment-method-description.enum';

export class SoftDeletePaymentMethodUseCase {
  private constructor(
    private readonly repository: PaymentMethodRepository,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: PaymentMethodRepository,
    now: () => string,
  ): SoftDeletePaymentMethodUseCase {
    return new SoftDeletePaymentMethodUseCase(repository, now);
  }

  public async execute(input: {
    descriptionEnum: PaymentMethodDescription;
  }): Promise<void> {
    const method = await this.repository.findActiveByEnum(
      input.descriptionEnum,
    );
    if (!method) throw new PaymentMethodNotFoundError(input.descriptionEnum);

    method.softDelete(this.now());
    await this.repository.softDelete(method);
  }
}
