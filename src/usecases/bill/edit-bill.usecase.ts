import { OutputDTO } from '@/domain/dtos/output.dto';
import { EditBillInputDTO, BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { Usecase } from '../usecase';
import { ValidateCategoryPaymentMethodUseCase } from '../validate_entities/validate-category-payment-method.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';

export type EditBillOutputDTO = OutputDTO<BillDTO | null>;

export class EditBillUseCase
  implements Usecase<EditBillInputDTO, EditBillOutputDTO>
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
    return new EditBillUseCase(
      billService,
      validateCategoryPaymentMethodService,
    );
  }

  public async execute({
    billId,
    billData,
    userId,
  }: EditBillInputDTO): Promise<EditBillOutputDTO> {
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

    const validateCategoryPaymentMethodService =
      await this.validateCategoryPaymentMethodService.execute({
        categoryId: billData.categoryId,
        paymentMethodId: billData.paymentMethodId,
      });

    if (!validateCategoryPaymentMethodService) {
      throw new ApiError(
        ERROR_MESSAGES.INVALID_CATEGORY_OR_PAYMENT_METHOD,
        400,
      );
    }

    const bill = await this.billService.updateBill({
      billId,
      billData,
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
