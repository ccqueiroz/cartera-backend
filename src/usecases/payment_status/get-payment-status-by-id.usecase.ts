import { OutputDTO } from '@/domain/dtos/output.dto';
import { Usecase } from '../usecase';
import { PaymentStatusDTO } from '@/domain/Payment_Status/dtos/payment-status.dto';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { PaymentStatusServiceGateway } from '@/domain/Payment_Status/gateway/payment-status.service.gateway';

export type GetPaymentStatusByIdInputDTO = Pick<PaymentStatusDTO, 'id'>;

export type GetPaymentStatusByIdOutputDTO = OutputDTO<PaymentStatusDTO | null>;

export class GetPaymentStatusByIdUseCase
  implements
    Usecase<GetPaymentStatusByIdInputDTO, GetPaymentStatusByIdOutputDTO>
{
  private constructor(
    private readonly paymentStatusService: PaymentStatusServiceGateway,
  ) {}

  public static create({
    paymentStatusService,
  }: {
    paymentStatusService: PaymentStatusServiceGateway;
  }) {
    return new GetPaymentStatusByIdUseCase(paymentStatusService);
  }

  public async execute({
    id,
  }: GetPaymentStatusByIdInputDTO): Promise<GetPaymentStatusByIdOutputDTO> {
    if (!id) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const paymentStatus = await this.paymentStatusService.getPaymentStatusById({
      id,
    });

    if (!paymentStatus || !paymentStatus?.id) {
      return { data: null };
    }

    return {
      data: {
        id: paymentStatus.id,
        description: paymentStatus.description,
        createdAt: paymentStatus.createdAt,
        updatedAt: paymentStatus.updatedAt,
      },
    };
  }
}
