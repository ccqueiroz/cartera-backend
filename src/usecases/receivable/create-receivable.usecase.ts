import {
  CreateReceivableInputDTO,
  CreateReceivableOutputDTO as TypeCreateReceivableOutputDTO,
} from '@/domain/Receivable/dtos/receivable.dto';
import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { ReceivableGateway } from '@/domain/Receivable/gateway/receivable.gateway';
import { ValidateCategoryPaymentMethodStatusUseCase } from '../validate_entities/validate-category-payment-method-status.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

export type CreateReceivableOutputDTO =
  OutputDTO<TypeCreateReceivableOutputDTO | null>;

export class CreateReceivableUseCase
  implements Usecase<CreateReceivableInputDTO, CreateReceivableOutputDTO>
{
  private constructor(
    private readonly receivableGateway: ReceivableGateway,
    private readonly validateCategoryPaymentMethodStatusService: ValidateCategoryPaymentMethodStatusUseCase,
  ) {}

  public static create({
    receivableGateway,
    validateCategoryPaymentMethodStatusService,
  }: {
    receivableGateway: ReceivableGateway;
    validateCategoryPaymentMethodStatusService: ValidateCategoryPaymentMethodStatusUseCase;
  }) {
    return new CreateReceivableUseCase(
      receivableGateway,
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

    const receivable = await this.receivableGateway.createReceivable({
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
