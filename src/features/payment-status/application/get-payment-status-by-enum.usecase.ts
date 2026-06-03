import { PaymentStatusCatalogOutput } from '@/features/payment-status/domain/payment-status-catalog.entity';
import { PaymentStatusRepository } from '@/features/payment-status/domain/ports/payment-status.repository.port';
import { PaymentStatusNotFoundError } from '@/features/payment-status/domain/errors/payment-status-not-found.error';
import { PaymentStatusCode } from '@/shared/kernel/enums/payment-status.enum';

export class GetPaymentStatusByEnumUseCase {
  private constructor(private readonly repository: PaymentStatusRepository) {}

  public static create(
    repository: PaymentStatusRepository,
  ): GetPaymentStatusByEnumUseCase {
    return new GetPaymentStatusByEnumUseCase(repository);
  }

  public async execute(input: {
    code: PaymentStatusCode;
  }): Promise<PaymentStatusCatalogOutput> {
    const status = await this.repository.findByCode(input.code);
    if (!status) throw new PaymentStatusNotFoundError(input.code);

    return status.toOutput();
  }
}
