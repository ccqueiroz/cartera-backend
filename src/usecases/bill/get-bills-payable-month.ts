import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { BillGateway } from '@/domain/Bill/gateway/bill.gateway';
import {
  BillsPayableMonthInputDTO,
  BillsPayableMonthOutPutDTO,
  StatusBill,
} from '@/domain/Bill/dtos/bill.dto';

export type GetBillsPayableMonthOutputDTO = OutputDTO<
  Array<BillsPayableMonthOutPutDTO>
>;

export class GetBillsPayableMonthUseCase
  implements Usecase<BillsPayableMonthInputDTO, GetBillsPayableMonthOutputDTO>
{
  private constructor(private readonly billGateway: BillGateway) {}

  public static create({ billGateway }: { billGateway: BillGateway }) {
    return new GetBillsPayableMonthUseCase(billGateway);
  }

  private handleSetInvoiceStatus(billDate: number, referenceDate: number) {
    const milleSecondsPerDay = 1000 * 60 * 60 * 24;
    const diffInDays = Math.floor(
      (billDate - referenceDate) / milleSecondsPerDay,
    );

    if (referenceDate > billDate) {
      return StatusBill.OVERDUE;
    }

    if (diffInDays > 5) {
      return StatusBill.PENDING;
    }

    if (diffInDays > 0 && diffInDays <= 5) {
      return StatusBill.DUE_SOON;
    }

    if (diffInDays === 0) {
      return StatusBill.DUE_DAY;
    }

    return StatusBill.PENDING;
  }

  public async execute(
    inputGetBills: BillsPayableMonthInputDTO,
  ): Promise<GetBillsPayableMonthOutputDTO> {
    if (!inputGetBills.userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const bills = await this.billGateway.billsPayableMonth({
      ...inputGetBills,
    });

    const data = bills.map((item) => {
      return {
        id: item.id,
        amount: item.amount,
        billDate: item.billDate,
        categoryId: item.categoryId,
        categoryDescription: item.categoryDescription,
        status: this.handleSetInvoiceStatus(
          Number(item.billDate),
          new Date().getTime(),
        ),
      };
    }) as Array<BillsPayableMonthOutPutDTO>;

    return {
      data,
    };
  }
}
