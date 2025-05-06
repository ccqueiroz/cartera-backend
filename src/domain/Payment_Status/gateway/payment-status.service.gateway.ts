import { PaymentStatusDTO } from '../dtos/payment-status.dto';

export interface PaymentStatusServiceGateway {
  getPaymentStatus(): Promise<Array<PaymentStatusDTO>>;
  getPaymentStatusById({
    id,
  }: Pick<PaymentStatusDTO, 'id'>): Promise<PaymentStatusDTO | null>;
}
