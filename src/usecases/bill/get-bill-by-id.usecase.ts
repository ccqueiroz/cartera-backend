import { OutputDTO } from '@/domain/dtos/output.dto';
import { Usecase } from '../usecase';
import { BillDTO, GetBillByIdInputDTO } from '@/domain/Bill/dtos/bill.dto';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';

export type GetBillByIdOutputDTO = OutputDTO<BillDTO | null>;

export class GetBillByIdUseCase
  implements Usecase<GetBillByIdInputDTO, GetBillByIdOutputDTO>
{
  private constructor(private readonly billService: BillServiceGateway) {}

  public static create({ billService }: { billService: BillServiceGateway }) {
    return new GetBillByIdUseCase(billService);
  }

  public async execute({
    id: billId,
    userId,
  }: GetBillByIdInputDTO): Promise<GetBillByIdOutputDTO> {
    if (!userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (!billId) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);
    }

    const bill = await this.billService.getBillById({
      id: billId,
      userId,
    });

    if (!bill || !Object.prototype.hasOwnProperty.call(bill, 'id')) {
      return { data: null };
    }

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
        paymentStatusId: bill.paymentStatusId,
        paymentStatusDescription: bill.paymentStatusDescription,
        categoryId: bill.categoryId,
        categoryDescription: bill.categoryDescription,
        paymentMethodId: bill.paymentMethodId,
        paymentMethodDescription: bill.paymentMethodDescription,
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
