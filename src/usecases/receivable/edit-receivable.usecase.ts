import { OutputDTO } from '@/domain/dtos/output.dto';
import {
  EditReceivableInputDTO,
  ReceivableDTO,
} from '@/domain/Receivable/dtos/receivable.dto';
import { Usecase } from '../usecase';
import { ReceivableGateway } from '@/domain/Receivable/gateway/receivable.gateway';
import { ValidateCategoryPaymentMethodStatusUseCase } from '../validate_entities/validate-category-payment-method-status.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

export type EditReceivableOutputDTO = OutputDTO<ReceivableDTO | null>;

export class EditReceivableUseCase
  implements Usecase<EditReceivableInputDTO, EditReceivableOutputDTO>
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
    return new EditReceivableUseCase(
      receivableGateway,
      validateCategoryPaymentMethodStatusService,
    );
  }

  public async execute({
    receivableId,
    receivableData,
    userId,
  }: EditReceivableInputDTO): Promise<EditReceivableOutputDTO> {
    if (!userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (!receivableId) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const hasReceivable = await this.receivableGateway.getReceivableById({
      id: receivableId,
      userId,
    });

    if (!hasReceivable) {
      throw new ApiError(ERROR_MESSAGES.RECEIVABLE_NOT_FOUND, 404);
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

    const receivable = await this.receivableGateway.updateReceivable({
      receivableId,
      receivableData,
      userId,
    });

    return {
      data: {
        id: receivable.id,
        personUserId: receivable.personUserId,
        userId: receivable.userId,
        descriptionReceivable: receivable.descriptionReceivable,
        fixedReceivable: receivable.fixedReceivable,
        receivableDate: receivable.receivableDate,
        icon: receivable?.icon ?? null,
        amount: receivable.amount,
        paymentStatusId: receivable.paymentStatusId,
        paymentStatusDescription: receivable.paymentStatusDescription,
        categoryId: receivable.categoryId,
        categoryDescription: receivable.categoryDescription,
        paymentMethodId: receivable.paymentMethodId,
        paymentMethodDescription: receivable.paymentMethodDescription,
        receival: receivable.receival,
        receivalDate: receivable.receivableDate,
        createdAt: receivable.createdAt,
        updatedAt: receivable.updatedAt,
      },
    };
  }
}
