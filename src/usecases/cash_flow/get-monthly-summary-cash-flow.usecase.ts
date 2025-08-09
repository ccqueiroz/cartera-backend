import {
  GetMonthlySummaryCashFlowInputDTO,
  MonthlySummaryCashFlowOutputDTO,
} from '@/domain/Cash_Flow/dtos/cash-flow.dto';
import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { ReceivableDTO } from '@/domain/Receivable/dtos/receivable.dto';

type GetMonthlySummaryCashFlowUseCaseOutput =
  OutputDTO<MonthlySummaryCashFlowOutputDTO>;

type KeyToTypeMap = {
  fixedBill: BillDTO & { fixedBill: boolean };
  fixedReceivable: ReceivableDTO & { fixedReceivable: boolean };
};

export class GetMonthlySummaryCashFlowUseCase
  implements
    Usecase<
      GetMonthlySummaryCashFlowInputDTO,
      GetMonthlySummaryCashFlowUseCaseOutput
    >
{
  private constructor(
    private readonly receivableService: ReceivableServiceGateway,
    private readonly billService: BillServiceGateway,
  ) {}

  public static create({
    receivableService,
    billService,
  }: {
    receivableService: ReceivableServiceGateway;
    billService: BillServiceGateway;
  }) {
    return new GetMonthlySummaryCashFlowUseCase(receivableService, billService);
  }

  private getInitialAndFinalPeriod(month: number, year: number) {
    const initialPeriod = new Date(year, month, 1).getTime();
    const finalPeriod = new Date(year, month + 1, 0).getTime();

    return {
      initialPeriod,
      finalPeriod,
    };
  }

  private getTotalAmountByFixedAndVariableItems<K extends keyof KeyToTypeMap>(
    key: K,
    list: Array<KeyToTypeMap[K]>,
  ) {
    let fixedAmount = 0;
    let variableAmount = 0;

    list.forEach((item) => {
      if ((item as Record<K, boolean>)[key]) {
        fixedAmount += item.amount;
      } else {
        variableAmount += item.amount;
      }
    });

    return {
      fixedAmount,
      variableAmount,
    };
  }

  private async getListBillsAndReceivables(
    userId: string,
    year: number,
    month: number,
    paid: boolean,
  ) {
    const { initialPeriod, finalPeriod } = this.getInitialAndFinalPeriod(
      month,
      year,
    );

    const [listBillsByGateway, listReceivablesByGateway] =
      await Promise.allSettled([
        this.billService.handleQueryBillsByFilters({
          userId,
          period: {
            initialDate: new Date(initialPeriod).getTime(),
            finalDate: new Date(finalPeriod).getTime(),
          },
          filters: {
            paid,
          },
        }),
        this.receivableService.handleQueryReceivablesByFilters({
          userId,
          period: {
            initialDate: new Date(initialPeriod).getTime(),
            finalDate: new Date(finalPeriod).getTime(),
          },
        }),
      ]);

    if (
      listBillsByGateway.status === 'rejected' ||
      listReceivablesByGateway.status === 'rejected'
    ) {
      throw new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }

    return {
      listBills: listBillsByGateway.value.content,
      listReceivables: listReceivablesByGateway.value.content,
    };
  }

  public async execute({
    month,
    year,
    userId,
    paid = true,
  }: GetMonthlySummaryCashFlowInputDTO): Promise<GetMonthlySummaryCashFlowUseCaseOutput> {
    if (!userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (isNaN(year) || isNaN(month)) {
      throw new ApiError(ERROR_MESSAGES.INVALID_PERIOD, 400);
    }

    const { listBills, listReceivables } =
      await this.getListBillsAndReceivables(userId, year, month, paid);

    const [bills, receivables] = await Promise.allSettled([
      this.getTotalAmountByFixedAndVariableItems('fixedBill', listBills),
      this.getTotalAmountByFixedAndVariableItems(
        'fixedReceivable',
        listReceivables,
      ),
    ]);

    if (bills.status === 'rejected' || receivables.status === 'rejected') {
      throw new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }

    return {
      data: {
        fixedExpenses: bills.value.fixedAmount,
        variableExpenses: bills.value.variableAmount,
        fixedIncome: receivables.value.fixedAmount,
        variableRevenue: receivables.value.variableAmount,
      },
    };
  }
}
