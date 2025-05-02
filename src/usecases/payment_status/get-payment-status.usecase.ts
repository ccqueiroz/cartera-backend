import { OutputDTO } from '@/domain/dtos/output.dto';
import { Usecase } from '../usecase';
import { PaymentStatusDTO } from '@/domain/Payment_Status/dtos/payment-status.dto';
import { PaymentStatusServiceGateway } from '@/domain/Payment_Status/gateway/payment-status.service.gateway';

export type GetPaymentStatusInputDTO = void;

export type GetPaymentStatusOutputDTO = OutputDTO<Array<PaymentStatusDTO>>;

export class GetPaymentStatusUseCase
  implements Usecase<GetPaymentStatusInputDTO, GetPaymentStatusOutputDTO>
{
  private constructor(
    private readonly paymentStatusService: PaymentStatusServiceGateway,
  ) {}

  public static create({
    paymentStatusService,
  }: {
    paymentStatusService: PaymentStatusServiceGateway;
  }) {
    return new GetPaymentStatusUseCase(paymentStatusService);
  }

  public async execute(): Promise<GetPaymentStatusOutputDTO> {
    const paymentStatus = await this.paymentStatusService.getPaymentStatus();

    return {
      data: paymentStatus,
    };
  }
}
