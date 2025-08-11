import { Usecase } from './../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { PaymentMethodDTO } from '@/domain/Payment_Method/dtos/payment-method.dto';
import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ApiError } from '@/helpers/errors';

export type GetPaymentMethodByDescriptioIdInputDTO = Pick<
  PaymentMethodDTO,
  'descriptionEnum'
>;

export type GetPaymentMethodByDescriptioIdOutputDTO =
  OutputDTO<PaymentMethodDTO | null>;

export class GetPaymentMethodByDescriptionUseCase
  implements
    Usecase<
      GetPaymentMethodByDescriptioIdInputDTO,
      GetPaymentMethodByDescriptioIdOutputDTO
    >
{
  private constructor(
    private readonly paymentMethodService: PaymentMethodServiceGateway,
  ) {}

  public static create({
    paymentMethodService,
  }: {
    paymentMethodService: PaymentMethodServiceGateway;
  }) {
    return new GetPaymentMethodByDescriptionUseCase(paymentMethodService);
  }

  public async execute({
    descriptionEnum,
  }: GetPaymentMethodByDescriptioIdInputDTO): Promise<GetPaymentMethodByDescriptioIdOutputDTO> {
    if (!descriptionEnum) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const paymentMethod =
      await this.paymentMethodService.getPaymentMethodByDescriptionEnum({
        descriptionEnum,
      });

    if (!paymentMethod || !paymentMethod?.id) {
      return { data: null };
    }

    return {
      data: {
        id: paymentMethod.id,
        description: paymentMethod.description,
        descriptionEnum: paymentMethod.descriptionEnum,
        createdAt: paymentMethod.createdAt,
        updatedAt: paymentMethod.updatedAt,
      },
    };
  }
}
