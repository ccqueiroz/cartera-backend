import { OutputDTO } from '@/domain/dtos/output.dto';
import { Usecase } from '../usecase';
import { PaymentStatusDTO } from '@/domain/Payment_Status/dtos/payment-status.dto';
import { PaymentStatusGateway } from '@/domain/Payment_Status/gateway/payment-status.gateway';

export type GetPaymentStatusInputDTO = void;

export type GetPaymentStatusOutputDTO = OutputDTO<Array<PaymentStatusDTO>>;

export class GetPaymentStatusUseCase
  implements Usecase<GetPaymentStatusInputDTO, GetPaymentStatusOutputDTO>
{
  private constructor(
    private readonly paymentStatusGateway: PaymentStatusGateway,
  ) {}

  public static create({
    paymentStatusGateway,
  }: {
    paymentStatusGateway: PaymentStatusGateway;
  }) {
    return new GetPaymentStatusUseCase(paymentStatusGateway);
  }

  public async execute(): Promise<GetPaymentStatusOutputDTO> {
    const paymentStatus = await this.paymentStatusGateway.getPaymentStatus();

    return {
      data: paymentStatus,
    };
  }
}
