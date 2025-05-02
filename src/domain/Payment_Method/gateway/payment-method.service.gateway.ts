import { PaymentMethodDTO } from '../dtos/payment-method.dto';

export interface PaymentMethodServiceGateway {
  getPaymentMethods(): Promise<Array<PaymentMethodDTO>>;
  getPaymentMethodById({
    id,
  }: Pick<PaymentMethodDTO, 'id'>): Promise<PaymentMethodDTO | null>;
}
