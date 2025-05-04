import {
  CreateReceivableInputDTO,
  CreateReceivableOutputDTO as TypeCreateReceivableOutputDTO,
} from '@/domain/Receivable/dtos/receivable.dto';
import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { ValidateCategoryPaymentMethodStatusUseCase } from '../validate_entities/validate-category-payment-method-status.usecase';
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
    private readonly validateCategoryPaymentMethodStatusService: ValidateCategoryPaymentMethodStatusUseCase,
  ) {}

  public static create({
    receivableService,
    validateCategoryPaymentMethodStatusService,
  }: {
    receivableService: ReceivableServiceGateway;
    validateCategoryPaymentMethodStatusService: ValidateCategoryPaymentMethodStatusUseCase;
  }) {
    return new CreateReceivableUseCase(
      receivableService,
      validateCategoryPaymentMethodStatusService,
    );
  }

  public async execute({
    receivableData,
    userId,
  }: CreateReceivableInputDTO): Promise<CreateReceivableOutputDTO> {
    if (!userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const validateCategoryPaymentMethodStatusService =
      await this.validateCategoryPaymentMethodStatusService.execute({
        categoryId: receivableData.categoryId,
        paymentMethodId: receivableData.paymentMethodId,
        paymentStatusId: receivableData.paymentStatusId,
      });

    if (!validateCategoryPaymentMethodStatusService) {
      throw new ApiError(
        ERROR_MESSAGES.INVALID_CATEGORY_PAYMENT_METHOD_OR_PAYMENT_STATUS,
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
