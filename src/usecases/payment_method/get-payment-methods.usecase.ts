import { OutputDTO } from '@/domain/dtos/output.dto';
import { Usecase } from '../usecase';
import { PaymentMethodDTO } from '@/domain/Payment_Method/dtos/payment-method.dto';
import { PaymentMethodGateway } from '@/domain/Payment_Method/gateway/payment-method.gateway';

export type GetPaymentMethodsInputDTO = void;

export type GetPaymentMethodsOutputDTO = OutputDTO<Array<PaymentMethodDTO>>;

export class GetPaymentMethodsUseCase
  implements Usecase<GetPaymentMethodsInputDTO, GetPaymentMethodsOutputDTO>
{
  private constructor(
    private readonly paymentMethodGateway: PaymentMethodGateway,
  ) {}

  public static create({
    paymentMethodGateway,
  }: {
    paymentMethodGateway: PaymentMethodGateway;
  }) {
    return new GetPaymentMethodsUseCase(paymentMethodGateway);
  }

  public async execute(): Promise<GetPaymentMethodsOutputDTO> {
    const paymentMethods = await this.paymentMethodGateway.getPaymentMethods();

    return {
      data: paymentMethods,
    };
  }
}
