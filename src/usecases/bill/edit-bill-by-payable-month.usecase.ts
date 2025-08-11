import { EditBillByPayableMonthInputDTO } from '@/domain/Bill/dtos/bill.dto';
import { EditBillOutputDTO } from './edit-bill.usecase';
import { Usecase } from '../usecase';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';
import { ValidateCategoryPaymentMethodUseCase } from '../validate_entities/validate-category-payment-method.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

export class EditBillByPayableMonthUseCase
  implements Usecase<EditBillByPayableMonthInputDTO, EditBillOutputDTO>
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
    return new EditBillByPayableMonthUseCase(
      billService,
      validateCategoryPaymentMethodService,
    );
  }

  public async execute({
    billId,
    billData,
    userId,
  }: EditBillByPayableMonthInputDTO): Promise<EditBillOutputDTO> {
    if (!userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (!billId) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const hasBill = await this.billService.getBillById({
      id: billId,
      userId,
    });

    if (!hasBill) {
      throw new ApiError(ERROR_MESSAGES.BILL_NOT_FOUND, 404);
    }

    if (billData.payOut && hasBill.payOut) {
      throw new ApiError(
        ERROR_MESSAGES.BILL_HAS_ALREADY_BEEN_PAY.replace(
          '{billDescription}',
          hasBill.descriptionBill,
        ),
        400,
      );
    }

    const { payDate, payOut, paymentMethodDescriptionEnum } = billData;

    if (!payDate || (payOut && !payDate)) {
      throw new ApiError(ERROR_MESSAGES.INFORME_PAY_DATE_BILL, 400);
    }

    if (hasBill.createdAt && payDate < hasBill.createdAt) {
      throw new ApiError(
        ERROR_MESSAGES.BILL_PAY_DATE_CANNOT_BE_PRIOR_THE_ACCOUNT_CREATE_DATE,
        400,
      );
    }

    if (payOut && !paymentMethodDescriptionEnum) {
      throw new ApiError(ERROR_MESSAGES.INFORME_PAYMENT_METHOD, 400);
    }

    const { isValidEntities, category, paymentMethod } =
      await this.validateCategoryPaymentMethodService.execute({
        categoryDescriptionEnum: hasBill.categoryDescriptionEnum,
        paymentMethodDescriptionEnum: billData.paymentMethodDescriptionEnum,
      });

    if (!isValidEntities || !category || !paymentMethod) {
      throw new ApiError(
        ERROR_MESSAGES.INVALID_CATEGORY_OR_PAYMENT_METHOD,
        400,
      );
    }

    const bill = await this.billService.updateBill({
      billId,
      billData: {
        ...hasBill,
        payOut,
        payDate,
        paymentMethodId: paymentMethod.id,
        paymentMethodDescription: paymentMethod.description,
        paymentMethodDescriptionEnum: paymentMethod.descriptionEnum,
      },
      userId,
    });

    return {
      data: {
        id: bill.id,
        personUserId: bill.personUserId,
        userId: bill.userId,
        descriptionBill: bill.descriptionBill,
        fixedBill: bill.fixedBill,
        billDate: bill.billDate,
        icon: bill?.icon ?? null,
        amount: bill.amount,
        categoryId: bill.categoryId,
        categoryDescription: bill.categoryDescription,
        categoryDescriptionEnum: bill.categoryDescriptionEnum,
        categoryGroup: bill.categoryGroup,
        paymentMethodId: bill.paymentMethodId,
        paymentMethodDescription: bill.paymentMethodDescription,
        paymentMethodDescriptionEnum: bill.paymentMethodDescriptionEnum,
        paymentStatus: bill.paymentStatus,
        payOut: bill.payOut,
        payDate: bill.payDate,
        invoiceCarData: bill.invoiceCarData,
        shoppingListData: bill.shoppingListData,
        isPaymentCardBill: bill.isPaymentCardBill,
        isShoppingListBill: bill.isShoppingListBill,
        createdAt: bill.createdAt,
        updatedAt: bill.updatedAt,
      },
    };
  }
}
