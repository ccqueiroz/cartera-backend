import {
  CreateReceivableInputDTO,
  CreateReceivableOutputDTO as TypeCreateReceivableOutputDTO,
} from '@/domain/Receivable/dtos/receivable.dto';
import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { ValidateCategoryPaymentMethodUseCase } from '../validate_entities/validate-category-payment-method.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';

export type CreateReceivableOutputDTO =
  OutputDTO<TypeCreateReceivableOutputDTO | null>;

export class CreateReceivableUseCase
  implements Usecase<CreateReceivableInputDTO, CreateReceivableOutputDTO>
{
  private constructor(
    private readonly receivableService: ReceivableServiceGateway,
    private readonly validateCategoryPaymentMethodService: ValidateCategoryPaymentMethodUseCase,
  ) {}

  public static create({
    receivableService,
    validateCategoryPaymentMethodService,
  }: {
    receivableService: ReceivableServiceGateway;
    validateCategoryPaymentMethodService: ValidateCategoryPaymentMethodUseCase;
  }) {
    return new CreateReceivableUseCase(
      receivableService,
      validateCategoryPaymentMethodService,
    );
  }

  public async execute({
    receivableData,
    userId,
  }: CreateReceivableInputDTO): Promise<CreateReceivableOutputDTO> {
    if (!userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (receivableData.receival && !receivableData?.receivalDate) {
      throw new ApiError(ERROR_MESSAGES.INFORME_PAY_DATE_BILL, 400);
    }

    if (receivableData.receival && !receivableData?.paymentMethodId) {
      throw new ApiError(ERROR_MESSAGES.INFORME_PAYMENT_METHOD, 400);
    }

    const validateCategoryPaymentMethodService =
      await this.validateCategoryPaymentMethodService.execute({
        categoryId: receivableData.categoryId,
        paymentMethodId: receivableData?.paymentMethodId,
      });

    if (!validateCategoryPaymentMethodService) {
      throw new ApiError(
        ERROR_MESSAGES.INVALID_CATEGORY_OR_PAYMENT_METHOD,
        400,
      );
    }

    const receivable = await this.receivableService.createReceivable({
      receivableData,
      userId,
    });

    if (
      !receivable ||
      !Object.prototype.hasOwnProperty.call(receivable, 'id') ||
      !receivable?.id
    ) {
      return { data: null };
    }

    return {
      data: {
        id: receivable!.id,
      },
    };
  }
}
