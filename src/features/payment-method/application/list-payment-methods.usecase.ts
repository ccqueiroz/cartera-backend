import { PaymentMethodOutput } from '@/features/payment-method/domain/payment-method.entity';
import { PaymentMethodRepository } from '@/features/payment-method/domain/ports/payment-method.repository.port';

export class ListPaymentMethodsUseCase {
  private constructor(private readonly repository: PaymentMethodRepository) {}

  public static create(
    repository: PaymentMethodRepository,
  ): ListPaymentMethodsUseCase {
    return new ListPaymentMethodsUseCase(repository);
  }

  public async execute(): Promise<PaymentMethodOutput[]> {
    const methods = await this.repository.listActive();
    return methods.map((method) => method.toOutput());
  }
}
