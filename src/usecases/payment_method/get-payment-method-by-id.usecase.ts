import { OutputDTO } from '@/domain/dtos/output.dto';
import { Usecase } from '../usecase';
import { PaymentMethodDTO } from '@/domain/Payment_Method/dtos/payment-method.dto';
import { PaymentMethodGateway } from '@/domain/Payment_Method/gateway/payment-method.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

export type GetPaymentMethodByIdInputDTO = Pick<PaymentMethodDTO, 'id'>;

export type GetPaymentMethodByIdOutputDTO = OutputDTO<PaymentMethodDTO | null>;

export class GetPaymentMethodByIdUseCase
  implements
    Usecase<GetPaymentMethodByIdInputDTO, GetPaymentMethodByIdOutputDTO>
{
  private constructor(
    private readonly paymentMethodGateway: PaymentMethodGateway,
  ) {}

  public static create({
    paymentMethodGateway,
  }: {
    paymentMethodGateway: PaymentMethodGateway;
  }) {
    return new GetPaymentMethodByIdUseCase(paymentMethodGateway);
  }

  public async execute({
    id,
  }: GetPaymentMethodByIdInputDTO): Promise<GetPaymentMethodByIdOutputDTO> {
    if (!id) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const paymentMethod = await this.paymentMethodGateway.getPaymentMethodById({
      id,
    });

    return {
      data: paymentMethod,
    };
  }
}
