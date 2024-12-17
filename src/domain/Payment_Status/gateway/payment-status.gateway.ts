import { PaymentStatusDTO } from '../dtos/payment-status.dto';

export interface PaymentStatusGateway {
  getPaymentStatus(): Promise<Array<PaymentStatusDTO>>;
  getPaymentStatusById({
    id,
  }: Pick<PaymentStatusDTO, 'id'>): Promise<PaymentStatusDTO | null>;
}
