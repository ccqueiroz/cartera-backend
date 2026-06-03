import { PaymentMethod } from '@/features/payment-method/domain/payment-method.entity';
import { PaymentMethodRepository } from '@/features/payment-method/domain/ports/payment-method.repository.port';
import { PaymentMethodNotFoundError } from '@/features/payment-method/domain/errors/payment-method-not-found.error';
import { PaymentMethodDeletedError } from '@/features/payment-method/domain/errors/payment-method-deleted.error';

interface UpdatePaymentMethodInput {
  id: string;
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
    const method = await this.repository.findById(input.id);
    if (!method) throw new PaymentMethodNotFoundError(input.id);
    if (!method.isActive) throw new PaymentMethodDeletedError();

    method.updateDescription(input.description, this.now());
    await this.repository.update(method);
    return method;
  }
}
