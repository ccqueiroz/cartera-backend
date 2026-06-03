import { PaymentMethodRepository } from '@/features/payment-method/domain/ports/payment-method.repository.port';
import { PaymentMethodNotFoundError } from '@/features/payment-method/domain/errors/payment-method-not-found.error';

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

  public async execute(input: { id: string }): Promise<void> {
    const method = await this.repository.findById(input.id);
    if (!method) throw new PaymentMethodNotFoundError(input.id);

    if (!method.isActive) return;

    method.softDelete(this.now());
    await this.repository.softDelete(method);
  }
}
