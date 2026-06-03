import { PaymentStatusCatalog } from '@/features/payment-status/domain/payment-status-catalog.entity';
import { PaymentStatusCode } from '@/shared/kernel/enums/payment-status.enum';

export interface PaymentStatusRepository {
  listAll(): Promise<PaymentStatusCatalog[]>;
  findByCode(code: PaymentStatusCode): Promise<PaymentStatusCatalog | null>;
}
