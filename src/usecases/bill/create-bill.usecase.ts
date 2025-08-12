import {
  BillDTO,
  CreateBillOutputDTO as TypeCreateBillOutputDTO,
} from '@/domain/Bill/dtos/bill.dto';
import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { ValidateCategoryPaymentMethodUseCase } from '../validate_entities/validate-category-payment-method.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';

type InputDTO = {
  billData: Omit<
    BillDTO,
    | 'id'
    | 'paymentStatus'
    | 'createdAt'
    | 'updatedAt'
    | 'categoryId'
    | 'categoryDescription'
    | 'categoryGroup'
    | 'paymentMethodId'
    | 'paymentMethodDescription'
  >;
  userId: string;
};

export type CreateBillOutputDTO = OutputDTO<TypeCreateBillOutputDTO | null>;

export class CreateBillUseCase
  implements Usecase<InputDTO, CreateBillOutputDTO>
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
  }: InputDTO): Promise<CreateBillOutputDTO> {
    if (!userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (billData.payOut && !billData?.payDate) {
      throw new ApiError(ERROR_MESSAGES.INFORME_PAY_DATE_BILL, 400);
    }

    if (billData.payOut && !billData?.paymentMethodDescriptionEnum) {
      throw new ApiError(ERROR_MESSAGES.INFORME_PAYMENT_METHOD, 400);
    }

    const { isValidEntities, category, paymentMethod } =
      await this.validateCategoryPaymentMethodService.execute({
        categoryDescriptionEnum: billData.categoryDescriptionEnum,
        paymentMethodDescriptionEnum: billData.paymentMethodDescriptionEnum,
      });

    if (!isValidEntities || !category) {
      throw new ApiError(
        ERROR_MESSAGES.INVALID_CATEGORY_OR_PAYMENT_METHOD,
        400,
      );
    }

    const bill = await this.billService.createBill({
      billData: {
        ...billData,
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
