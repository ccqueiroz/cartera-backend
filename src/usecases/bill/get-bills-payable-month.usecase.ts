import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import {
  BillsPayableMonthInputDTO,
  BillsPayableMonthOutPutDTO,
  StatusBill,
} from '@/domain/Bill/dtos/bill.dto';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';
import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';

export type GetBillsPayableMonthOutputDTO = OutputDTO<
  ResponseListDTO<BillsPayableMonthOutPutDTO>
>;

export class GetBillsPayableMonthUseCase
  implements Usecase<BillsPayableMonthInputDTO, GetBillsPayableMonthOutputDTO>
{
  private constructor(private readonly billService: BillServiceGateway) {}

  public static create({ billService }: { billService: BillServiceGateway }) {
    return new GetBillsPayableMonthUseCase(billService);
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

    if (
      !inputGetBills?.period ||
      !inputGetBills?.period?.initialDate ||
      !inputGetBills?.period?.finalDate ||
      isNaN(inputGetBills?.period.initialDate) ||
      isNaN(inputGetBills?.period.finalDate)
    ) {
      throw new ApiError(ERROR_MESSAGES.INVALID_PERIOD, 400);
    }

    const bills = await this.billService.billsPayableMonth({
      ...inputGetBills,
    });

    const data = bills.content.map((item) => {
      return {
        id: item.id,
        amount: item.amount,
        billDate: item.billDate,
        descriptionBill: item.descriptionBill,
        categoryId: item.categoryId,
        categoryDescription: item.categoryDescription,
        status: this.handleSetInvoiceStatus(
          Number(item.billDate),
          new Date().getTime(),
        ),
      };
    }) as Array<BillsPayableMonthOutPutDTO>;

    const billsPayables: ResponseListDTO<BillsPayableMonthOutPutDTO> = {
      ...bills,
      content: data,
    };

    return {
      data: billsPayables,
    };
  }
}
