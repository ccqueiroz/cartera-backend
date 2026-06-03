import { PaymentStatusCatalogOutput } from '@/features/payment-status/domain/payment-status-catalog.entity';
import { PaymentStatusRepository } from '@/features/payment-status/domain/ports/payment-status.repository.port';

export class ListPaymentStatusesUseCase {
  private constructor(private readonly repository: PaymentStatusRepository) {}

  public static create(
    repository: PaymentStatusRepository,
  ): ListPaymentStatusesUseCase {
    return new ListPaymentStatusesUseCase(repository);
  }

  public async execute(): Promise<PaymentStatusCatalogOutput[]> {
    const statuses = await this.repository.listAll();
    return statuses.map((status) => status.toOutput());
  }
}
