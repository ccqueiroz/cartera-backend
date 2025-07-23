import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import {
  BillsPayableMonthInputDTO,
  BillsPayableMonthOutPutDTO,
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
        personUserId: item.personUserId,
        userId: item.userId,
        descriptionBill: item.descriptionBill,
        fixedBill: item.fixedBill,
        amount: item.amount,
        billDate: item.billDate,
        categoryId: item.categoryId,
        categoryDescription: item.categoryDescription,
        categoryDescriptionEnum: item.categoryDescriptionEnum,
        categoryGroup: item.categoryGroup,
        status: item.paymentStatus,
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
