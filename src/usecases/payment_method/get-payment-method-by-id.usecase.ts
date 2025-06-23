import { OutputDTO } from '@/domain/dtos/output.dto';
import { Usecase } from '../usecase';
import { PaymentMethodDTO } from '@/domain/Payment_Method/dtos/payment-method.dto';
import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

export type GetPaymentMethodByIdInputDTO = Pick<PaymentMethodDTO, 'id'>;

export type GetPaymentMethodByIdOutputDTO = OutputDTO<PaymentMethodDTO | null>;

export class GetPaymentMethodByIdUseCase
  implements
    Usecase<GetPaymentMethodByIdInputDTO, GetPaymentMethodByIdOutputDTO>
{
  private constructor(
    private readonly paymentMethodService: PaymentMethodServiceGateway,
  ) {}

  public static create({
    paymentMethodService,
  }: {
    paymentMethodService: PaymentMethodServiceGateway;
  }) {
    return new GetPaymentMethodByIdUseCase(paymentMethodService);
  }

  public async execute({
    id,
  }: GetPaymentMethodByIdInputDTO): Promise<GetPaymentMethodByIdOutputDTO> {
    if (!id) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const paymentMethod = await this.paymentMethodService.getPaymentMethodById({
      id,
    });

    if (!paymentMethod || !paymentMethod?.id) {
      return { data: null };
    }

    return {
      data: {
        id: paymentMethod.id,
        description: paymentMethod.description,
        createdAt: paymentMethod.createdAt,
        updatedAt: paymentMethod.updatedAt,
      },
    };
  }
}
