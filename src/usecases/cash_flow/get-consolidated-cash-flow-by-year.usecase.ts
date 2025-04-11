import {
  CashFlowDTO,
  GetConsolidatedCashFlowByYearInputDTO,
} from '@/domain/Cash_Flow/dtos/cash-flow.dto';
import { Usecase } from '../usecase';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { ReceivableGateway } from '@/domain/Receivable/gateway/receivable.gateway';
import { BillGateway } from '@/domain/Bill/gateway/bill.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { ReceivableDTO } from '@/domain/Receivable/dtos/receivable.dto';
import { Months } from '@/domain/dtos/months.dto';
import { CashFlowEntitie } from '@/domain/Cash_Flow/entitie/cash-flow.entitie';

export type GetConsolidatedCashFlowByYearOutputDTO = OutputDTO<
  Array<CashFlowDTO>
>;

type ListWithSeparatedItems<T = BillDTO | ReceivableDTO> = {
  month: keyof typeof Months;
  list: Array<T>;
};

export class GetConsolidatedCashFlowByYearUseCase
  implements
    Usecase<
      GetConsolidatedCashFlowByYearInputDTO,
      GetConsolidatedCashFlowByYearOutputDTO
    >
{
  private MS_ONE_DAY = 60 * 60 * 24;
  private LIST_MONTHS: Array<keyof typeof Months> = Object.keys(
    Months,
  ) as Array<keyof typeof Months>;

  private constructor(
    private readonly receivableGateway: ReceivableGateway,
    private readonly billGateway: BillGateway,
  ) {}

  public static create({
    receivableGateway,
    billGateway,
  }: {
    receivableGateway: ReceivableGateway;
    billGateway: BillGateway;
  }) {
    return new GetConsolidatedCashFlowByYearUseCase(
      receivableGateway,
      billGateway,
    );
  }

  private getInitialAndFinalPeriod(month: number, year: number) {
    const initialPeriod = new Date(`${month}-01-${year}`).getTime();
    const finalPeriod =
      new Date(
        `${month === 12 ? '01' : month + 1}-01-${
          month === 12 ? year + 1 : year
        }`,
      ).getTime() - this.MS_ONE_DAY;

    return {
      initialPeriod,
      finalPeriod,
    };
  }

  private getItemByDate<T = BillDTO | ReceivableDTO>(
    list: Array<T>,
    key: 'billDate' | 'payDate' | 'receivableDate' | 'receivalDate',
    initalDate: number,
    finalDate: number,
  ) {
    const applyFiltersInList: Array<(item: T) => boolean> = [];

    applyFiltersInList.push((item) => {
      const date = Number((item as any)[key]);

      return date >= initalDate && date <= finalDate;
    });

    return applyFiltersInList.length === 0
      ? list
      : list.filter((item) =>
          applyFiltersInList.every((predicate) => predicate(item)),
        );
  }

  private separateItemsByMonthPeriod<T = BillDTO | ReceivableDTO>(
    year: number,
    key: 'billDate' | 'payDate' | 'receivableDate' | 'receivalDate',
    list: Array<T>,
  ) {
    let currentMonth = 1;

    const listWithSeparatedItems: Array<ListWithSeparatedItems<T>> = [];

    for (currentMonth; currentMonth <= 12; currentMonth++) {
      const period = this.getInitialAndFinalPeriod(currentMonth, year);

      const listByMonth = this.getItemByDate(
        list,
        key,
        period.initialPeriod,
        period.finalPeriod,
      );

      listWithSeparatedItems.push({
        month: this.LIST_MONTHS[currentMonth - 1],
        list: listByMonth,
      });
    }

    return listWithSeparatedItems;
  }

  private async getListBillsAndReceivables(userId: string, year: number) {
    const initialPeriod = `01-01-${year}`;
    const finalPeriod = `12-31-${year}`;

    const [listBillsByGateway, listReceivablesByGateway] =
      await Promise.allSettled([
        this.billGateway.getBills({
          userId,
          page: 0,
          size: 99999,
          searchByDate: {
            billDate: {
              initialDate: new Date(initialPeriod).getTime(),
              finalDate: new Date(finalPeriod).getTime(),
            },
          },
        }),
        this.receivableGateway.getReceivables({
          userId,
          page: 0,
          size: 99999,
          searchByDate: {
            receivableDate: {
              initialDate: new Date(initialPeriod).getTime(),
              finalDate: new Date(finalPeriod).getTime(),
            },
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
    year,
    userId,
  }: GetConsolidatedCashFlowByYearInputDTO): Promise<GetConsolidatedCashFlowByYearOutputDTO> {
    if (!userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (isNaN(year)) {
      throw new ApiError(ERROR_MESSAGES.INVALID_PERIOD, 400);
    }

    const { listBills, listReceivables } =
      await this.getListBillsAndReceivables(userId, year);

    const paidBills = listBills.filter((bill) => bill.payOut);
    const receivedReceivables = listReceivables.filter(
      (receivable) => receivable.receival,
    );

    const [
      listGeneralExpenses,
      listPaidExpenses,
      listGeneralIncomes,
      listPaidIncomes,
    ] = await Promise.allSettled([
      this.separateItemsByMonthPeriod<BillDTO>(year, 'billDate', listBills),
      this.separateItemsByMonthPeriod<BillDTO>(year, 'payDate', paidBills),
      this.separateItemsByMonthPeriod<ReceivableDTO>(
        year,
        'receivableDate',
        listReceivables,
      ),
      this.separateItemsByMonthPeriod<ReceivableDTO>(
        year,
        'receivalDate',
        receivedReceivables,
      ),
    ]);

    if (
      listGeneralExpenses.status === 'rejected' ||
      listPaidExpenses.status === 'rejected' ||
      listGeneralIncomes.status === 'rejected' ||
      listPaidIncomes.status === 'rejected'
    ) {
      throw new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);
    }

    const cashFlow = this.LIST_MONTHS.map((month, index) => {
      const generalExpenses = listGeneralExpenses.value[index].list;
      const paidExpenses = listPaidExpenses.value[index].list;
      const generalIncomes = listGeneralIncomes.value[index].list;
      const paidIncomes = listPaidIncomes.value[index].list;

      const cashFlowByMonth = CashFlowEntitie.create({
        year,
        month,
        listGeneralExpenses: generalExpenses,
        listPaidExpenses: paidExpenses,
        listGeneralIncomes: generalIncomes,
        listPaidIncomes: paidIncomes,
      });

      return {
        year: cashFlowByMonth.year,
        month: cashFlowByMonth.month,
        generalIncomes: cashFlowByMonth.generalIncomes,
        paidIncomes: cashFlowByMonth.paidIncomes,
        generalExpenses: cashFlowByMonth.generalExpenses,
        paidExpenses: cashFlowByMonth.paidExpenses,
        generalProfit: cashFlowByMonth.generalProfit,
        paidProfit: cashFlowByMonth.paidProfit,
      } as CashFlowDTO;
    });

    return {
      data: cashFlow,
    };
  }
}
