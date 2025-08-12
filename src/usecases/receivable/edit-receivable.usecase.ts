import { OutputDTO } from '@/domain/dtos/output.dto';
import { ReceivableDTO } from '@/domain/Receivable/dtos/receivable.dto';
import { Usecase } from '../usecase';
import { ValidateCategoryPaymentMethodUseCase } from '../validate_entities/validate-category-payment-method.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';

type InputDTO = {
  receivableData: Omit<
    ReceivableDTO,
    | 'paymentStatus'
    | 'updatedAt'
    | 'categoryId'
    | 'categoryDescription'
    | 'categoryGroup'
    | 'paymentMethodId'
    | 'paymentMethodDescription'
  >;
  userId: string;
  receivableId: string;
};

export type EditReceivableOutputDTO = OutputDTO<ReceivableDTO | null>;

export class EditReceivableUseCase
  implements Usecase<InputDTO, EditReceivableOutputDTO>
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
    return new EditReceivableUseCase(
      receivableService,
      validateCategoryPaymentMethodService,
    );
  }

  public async execute({
    receivableId,
    receivableData,
    userId,
  }: InputDTO): Promise<EditReceivableOutputDTO> {
    if (!userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (!receivableId) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const hasReceivable = await this.receivableService.getReceivableById({
      id: receivableId,
      userId,
    });

    if (receivableData.receival && !receivableData?.receivalDate) {
      throw new ApiError(ERROR_MESSAGES.INFORME_PAY_DATE_BILL, 400);
    }

    if (
      receivableData.receival &&
      !receivableData?.paymentMethodDescriptionEnum
    ) {
      throw new ApiError(ERROR_MESSAGES.INFORME_PAYMENT_METHOD, 400);
    }

    if (!hasReceivable) {
      throw new ApiError(ERROR_MESSAGES.RECEIVABLE_NOT_FOUND, 404);
    }

    const { isValidEntities, category, paymentMethod } =
      await this.validateCategoryPaymentMethodService.execute({
        categoryDescriptionEnum: receivableData.categoryDescriptionEnum,
        paymentMethodDescriptionEnum:
          receivableData.paymentMethodDescriptionEnum,
      });

    if (!isValidEntities || !category) {
      throw new ApiError(
        ERROR_MESSAGES.INVALID_CATEGORY_OR_PAYMENT_METHOD,
        400,
      );
    }

    const receivable = await this.receivableService.updateReceivable({
      receivableId,
      receivableData: {
        ...receivableData,
        paymentMethodId: paymentMethod?.id,
        paymentMethodDescription: paymentMethod?.description,
        paymentMethodDescriptionEnum: paymentMethod?.descriptionEnum,
        categoryId: category.id,
        categoryDescription: category.description,
        categoryDescriptionEnum: category.descriptionEnum,
        categoryGroup: category.group,
      },
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
        receivalDate: receivable.receivalDate,
        receival: receivable.receival,
        icon: receivable.icon,
        amount: receivable.amount,
        paymentStatus: receivable.paymentStatus,
        categoryId: receivable.categoryId,
        categoryDescription: receivable.categoryDescription,
        categoryDescriptionEnum: receivable.categoryDescriptionEnum,
        categoryGroup: receivable.categoryGroup,
        paymentMethodId: receivable.paymentMethodId,
        paymentMethodDescription: receivable.paymentMethodDescription,
        paymentMethodDescriptionEnum: receivable.paymentMethodDescriptionEnum,
        createdAt: receivable.createdAt,
        updatedAt: receivable.updatedAt,
      },
    };
  }
}
