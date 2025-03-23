import { OutputDTO } from '@/domain/dtos/output.dto';
import { EditBillInputDTO, BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { Usecase } from '../usecase';
import { ValidateCategoryPaymentMethodStatusUseCase } from '../validate_entities/validate-category-payment-method-status.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { BillGateway } from '@/domain/Bill/gateway/bill.gateway';

export type EditBillOutputDTO = OutputDTO<BillDTO | null>;

export class EditBillUseCase
  implements Usecase<EditBillInputDTO, EditBillOutputDTO>
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
    return new EditBillUseCase(
      billGateway,
      validateCategoryPaymentMethodStatusService,
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

    const hasReceivable = await this.billGateway.getBillById({
      id: billId,
      userId,
    });

    if (!hasReceivable) {
      throw new ApiError(ERROR_MESSAGES.BILL_NOT_FOUND, 404);
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

    const bill = await this.billGateway.updateBill({
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
        payDate: bill.payDate,
        payOut: bill.payOut,
        icon: bill?.icon ?? null,
        amount: bill.amount,
        paymentStatusId: bill.paymentStatusId,
        paymentStatusDescription: bill.paymentStatusDescription,
        categoryId: bill.categoryId,
        categoryDescription: bill.categoryDescription,
        paymentMethodId: bill.paymentMethodId,
        paymentMethodDescription: bill.paymentMethodDescription,
        isPaymentCardBill: bill.isPaymentCardBill,
        invoiceCarData: bill.invoiceCarData,
        isShoppingListBill: bill.isShoppingListBill,
        shoppingListData: bill.shoppingListData,
        createdAt: bill.createdAt,
        updatedAt: bill.updatedAt,
      },
    };
  }
}
