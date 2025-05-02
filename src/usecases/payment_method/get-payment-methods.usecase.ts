import { OutputDTO } from '@/domain/dtos/output.dto';
import { Usecase } from '../usecase';
import { PaymentMethodDTO } from '@/domain/Payment_Method/dtos/payment-method.dto';
import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';

export type GetPaymentMethodsInputDTO = void;

export type GetPaymentMethodsOutputDTO = OutputDTO<Array<PaymentMethodDTO>>;

export class GetPaymentMethodsUseCase
  implements Usecase<GetPaymentMethodsInputDTO, GetPaymentMethodsOutputDTO>
{
  private constructor(
    private readonly paymentMethodService: PaymentMethodServiceGateway,
  ) {}

  public static create({
    paymentMethodService,
  }: {
    paymentMethodService: PaymentMethodServiceGateway;
  }) {
    return new GetPaymentMethodsUseCase(paymentMethodService);
  }

  public async execute(): Promise<GetPaymentMethodsOutputDTO> {
    const paymentMethods = await this.paymentMethodService.getPaymentMethods();

    return {
      data: paymentMethods,
    };
  }
}
