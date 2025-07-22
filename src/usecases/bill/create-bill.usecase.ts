import {
  CreateBillInputDTO,
  CreateBillOutputDTO as TypeCreateBillOutputDTO,
} from '@/domain/Bill/dtos/bill.dto';
import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { ValidateCategoryPaymentMethodUseCase } from '../validate_entities/validate-category-payment-method.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';

export type CreateBillOutputDTO = OutputDTO<TypeCreateBillOutputDTO | null>;

export class CreateBillUseCase
  implements Usecase<CreateBillInputDTO, CreateBillOutputDTO>
{
  private constructor(
    private readonly billService: BillServiceGateway,
    private readonly validateCategoryPaymentMethodService: ValidateCategoryPaymentMethodUseCase,
  ) {}

  public static create({
    billService,
    validateCategoryPaymentMethodService,
  }: {
    billService: BillServiceGateway;
    validateCategoryPaymentMethodService: ValidateCategoryPaymentMethodUseCase;
  }) {
    return new CreateBillUseCase(
      billService,
      validateCategoryPaymentMethodService,
    );
  }

  public async execute({
    billData,
    userId,
  }: CreateBillInputDTO): Promise<CreateBillOutputDTO> {
    if (!userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const validateCategoryPaymentMethodService =
      await this.validateCategoryPaymentMethodService.execute({
        categoryId: billData.categoryId,
        paymentMethodId: billData?.paymentMethodId,
      });

    if (!validateCategoryPaymentMethodService) {
      throw new ApiError(
        ERROR_MESSAGES.INVALID_CATEGORY_OR_PAYMENT_METHOD,
        400,
      );
    }

    const bill = await this.billService.createBill({
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
