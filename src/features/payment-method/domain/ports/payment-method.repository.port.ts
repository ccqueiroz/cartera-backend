import { PaymentMethod } from '@/features/payment-method/domain/payment-method.entity';
import { PaymentMethodDescription } from '@/features/payment-method/domain/enums/payment-method-description.enum';

export interface PaymentMethodRepository {
  create(method: PaymentMethod): Promise<void>;
  findActiveByEnum(
    descriptionEnum: PaymentMethodDescription,
  ): Promise<PaymentMethod | null>;
  findLatestByEnum(
    descriptionEnum: PaymentMethodDescription,
  ): Promise<PaymentMethod | null>;
  findById(id: string): Promise<PaymentMethod | null>;
  listActive(): Promise<PaymentMethod[]>;
  update(method: PaymentMethod): Promise<void>;
  softDelete(method: PaymentMethod): Promise<void>;
}
