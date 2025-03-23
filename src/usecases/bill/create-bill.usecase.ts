import {
  CreateBillInputDTO,
  CreateBillOutputDTO as TypeCreateBillOutputDTO,
} from '@/domain/Bill/dtos/bill.dto';
import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { ValidateCategoryPaymentMethodStatusUseCase } from '../validate_entities/validate-category-payment-method-status.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { BillGateway } from '@/domain/Bill/gateway/bill.gateway';

export type CreateBillOutputDTO = OutputDTO<TypeCreateBillOutputDTO | null>;

export class CreateBillUseCase
  implements Usecase<CreateBillInputDTO, CreateBillOutputDTO>
{
  private constructor(
    private readonly billGateway: BillGateway,
    private readonly validateCategoryPaymentMethodStatusService: ValidateCategoryPaymentMethodStatusUseCase,
  ) {}

  public static create({
    billGateway,
    validateCategoryPaymentMethodStatusService,
  }: {
    billGateway: BillGateway;
    validateCategoryPaymentMethodStatusService: ValidateCategoryPaymentMethodStatusUseCase;
  }) {
    return new CreateBillUseCase(
      billGateway,
      validateCategoryPaymentMethodStatusService,
    );
  }

  public async execute({
    billData,
    userId,
  }: CreateBillInputDTO): Promise<CreateBillOutputDTO> {
    if (!userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const validateCategoryPaymentMethodStatusService =
      await this.validateCategoryPaymentMethodStatusService.execute({
        categoryId: billData.categoryId,
        paymentMethodId: billData.paymentMethodId,
        paymentStatusId: billData.paymentStatusId,
      });

    if (!validateCategoryPaymentMethodStatusService) {
      throw new ApiError(
        ERROR_MESSAGES.INVALID_CATEGORY_PAYMENT_METHOD_OR_PAYMENT_STATUS,
        400,
      );
    }

    const bill = await this.billGateway.createBill({
      billData,
      userId,
    });

    if (
      !bill ||
      !Object.prototype.hasOwnProperty.call(bill, 'id') ||
      !bill?.id
    ) {
      return { data: null };
    }

    return {
      data: {
        id: bill!.id,
      },
    };
  }
}
