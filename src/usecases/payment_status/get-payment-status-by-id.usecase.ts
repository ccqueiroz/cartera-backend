import { OutputDTO } from '@/domain/dtos/output.dto';
import { Usecase } from '../usecase';
import { PaymentStatusDTO } from '@/domain/Payment_Status/dtos/payment-status.dto';
import { PaymentStatusGateway } from '@/domain/Payment_Status/gateway/payment-status.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

export type GetPaymentStatusByIdInputDTO = Pick<PaymentStatusDTO, 'id'>;

export type GetPaymentStatusByIdOutputDTO = OutputDTO<PaymentStatusDTO | null>;

export class GetPaymentStatusByIdUseCase
  implements
    Usecase<GetPaymentStatusByIdInputDTO, GetPaymentStatusByIdOutputDTO>
{
  private constructor(
    private readonly paymentStatusGateway: PaymentStatusGateway,
  ) {}

  public static create({
    paymentStatusGateway,
  }: {
    paymentStatusGateway: PaymentStatusGateway;
  }) {
    return new GetPaymentStatusByIdUseCase(paymentStatusGateway);
  }

  public async execute({
    id,
  }: GetPaymentStatusByIdInputDTO): Promise<GetPaymentStatusByIdOutputDTO> {
    if (!id) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const paymentStatus = await this.paymentStatusGateway.getPaymentStatusById({
      id,
    });

    return {
      data: paymentStatus,
    };
  }
}
