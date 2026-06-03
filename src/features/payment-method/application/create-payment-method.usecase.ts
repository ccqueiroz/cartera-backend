import { PaymentMethod } from '@/features/payment-method/domain/payment-method.entity';
import { PaymentMethodRepository } from '@/features/payment-method/domain/ports/payment-method.repository.port';
import { PaymentMethodDescription } from '@/features/payment-method/domain/enums/payment-method-description.enum';
import { DuplicatePaymentMethodError } from '@/features/payment-method/domain/errors/duplicate-payment-method.error';

interface CreatePaymentMethodInput {
  description: string;
  descriptionEnum: PaymentMethodDescription;
}

export class CreatePaymentMethodUseCase {
  private constructor(
    private readonly repository: PaymentMethodRepository,
    private readonly generateId: () => string,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: PaymentMethodRepository,
    generateId: () => string,
    now: () => string,
  ): CreatePaymentMethodUseCase {
    return new CreatePaymentMethodUseCase(repository, generateId, now);
  }

  public async execute(
    input: CreatePaymentMethodInput,
  ): Promise<PaymentMethod> {
    const method = PaymentMethod.create({
      id: this.generateId(),
      description: input.description,
      descriptionEnum: input.descriptionEnum,
      createdAt: this.now(),
    });

    const active = await this.repository.findActiveByEnum(
      input.descriptionEnum,
    );
    if (active) throw new DuplicatePaymentMethodError(input.descriptionEnum);

    await this.repository.create(method);
    return method;
  }
}
