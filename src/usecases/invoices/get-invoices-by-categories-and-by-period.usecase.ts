import { CategoryDescriptionEnumType } from './../../domain/Category/dtos/category.dto';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { Usecase } from '../usecase';
import {
  GetInvoicesByCategoryAndPeriodInputDTO,
  InvoiceByCategoryAndByPeriodOutput,
  InvoiceCategory,
  PeriodInvoicesByCategory,
} from '@/domain/Invoice/dtos/invoice.dto';
import {
  BillDTO,
  QueryBillsByFilterInputDTO,
} from '@/domain/Bill/dtos/bill.dto';
import {
  QueryReceivablesByFilterInputDTO,
  ReceivableDTO,
} from '@/domain/Receivable/dtos/receivable.dto';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';
import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

export type GetInvoicesByCategoriesAndByPeriodOutputDTO =
  OutputDTO<InvoiceByCategoryAndByPeriodOutput>;

type MapInvoice = Partial<Record<CategoryDescriptionEnumType, InvoiceCategory>>;

export class GetInvoicesByCategoriesAndByPeriodUseCase
  implements
    Usecase<
      GetInvoicesByCategoryAndPeriodInputDTO,
      GetInvoicesByCategoriesAndByPeriodOutputDTO
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
    return new GetInvoicesByCategoriesAndByPeriodUseCase(
      receivableService,
      billService,
    );
  }

  private getInitialAndFinalPeriod(period: PeriodInvoicesByCategory) {
    const initialPeriod = new Date(period.initialDate);

    const finalPeriod = new Date(period.finalDate);

    const initialDateFormated = Intl.DateTimeFormat('pt-BR', {
      timeZone: 'UTC',
    }).format(initialPeriod);

    const finalDateFormated = Intl.DateTimeFormat('pt-BR', {
      timeZone: 'UTC',
    }).format(finalPeriod);

    return `${initialDateFormated} - ${finalDateFormated}`;
  }

  private convertCategoriesInList(mapInvoice: MapInvoice) {
    const list = Object.values(mapInvoice).sort(
      (a, b) => b.percentByPeriod - a.percentByPeriod,
    );

    return list;
  }

  private separateItemsByMonthPeriod<
    T extends Array<BillDTO> | Array<ReceivableDTO>,
  >(list: T, type: CategoryType, totalInvoicedAmount: number) {
    const mapInvoices: MapInvoice = {};

    for (const invoice of list) {
      const {
        categoryDescription: description,
        categoryDescriptionEnum: category,
        amount,
        categoryGroup: group,
      } = invoice;

      if (!mapInvoices[category]) {
        mapInvoices[category] = {
          description,
          totalAmount: amount,
          descriptionEnum: category,
          group,
          percentByPeriod: 0,
          type,
        };
      } else {
        mapInvoices[category].totalAmount += amount;
      }

      const percentByPeriod = this.getCategoryPercentByPeriod(
        totalInvoicedAmount,
        mapInvoices[category].totalAmount,
      );

      mapInvoices[category].percentByPeriod = +percentByPeriod;
    }

    return this.convertCategoriesInList(mapInvoices);
  }

  private async getListInvoices({
    userId,
    period,
    type,
    paid,
  }: GetInvoicesByCategoryAndPeriodInputDTO) {
    let promise:
      | ((
          input: QueryBillsByFilterInputDTO,
        ) => Promise<ResponseListDTO<BillDTO>>)
      | ((
          input: QueryReceivablesByFilterInputDTO,
        ) => Promise<ResponseListDTO<ReceivableDTO>>);

    if (type === CategoryType.BILLS) {
      promise = this.billService.handleQueryBillsByFilters.bind(
        this.billService,
      );
    } else {
      promise = this.receivableService.handleQueryReceivablesByFilters.bind(
        this.receivableService,
      );
    }
    const filters = paid !== undefined ? { paid } : {};

    const responseList = await promise({
      userId,
      period,
      filters,
    });

    return {
      list: responseList.content,
    };
  }

  private getTotalInvoiceAmount<
    T extends Array<BillDTO> | Array<ReceivableDTO>,
  >(list: T, type: CategoryType) {
    let totalAmount: number;

    if (type === CategoryType.BILLS) {
      totalAmount = this.billService.totalAmountBills(list as Array<BillDTO>);
    } else {
      totalAmount = this.receivableService.totalAmountReceivables(
        list as Array<ReceivableDTO>,
      );
    }

    return totalAmount;
  }

  private getCategoryPercentByPeriod(
    totalInvoiceAmount: number,
    totalCategoryAmount: number,
  ) {
    const total = ((totalCategoryAmount / totalInvoiceAmount) * 100).toFixed(2);

    return +total;
  }

  public async execute({
    userId,
    period,
    type,
    paid,
  }: GetInvoicesByCategoryAndPeriodInputDTO): Promise<GetInvoicesByCategoriesAndByPeriodOutputDTO> {
    if (!userId) {
      throw new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    if (
      isNaN(period.initialDate) ||
      isNaN(period.finalDate) ||
      period.initialDate > period.finalDate
    ) {
      throw new ApiError(ERROR_MESSAGES.INVALID_PERIOD, 400);
    }

    if (!type || !CategoryType[type]) {
      throw new ApiError(ERROR_MESSAGES.CATEGORY_NOT_EXIST, 400);
    }

    const listInvoices = await this.getListInvoices({
      userId,
      period,
      type,
      paid,
    });

    const totalInvoicedAmount = this.getTotalInvoiceAmount(
      listInvoices.list,
      type,
    );

    const analyzedPeriod = this.getInitialAndFinalPeriod(period);

    const buildInvoicesByCategory = this.separateItemsByMonthPeriod(
      listInvoices.list,
      type,
      totalInvoicedAmount,
    );

    return {
      data: {
        listInvoices: buildInvoicesByCategory,
        period: analyzedPeriod,
        totalInvoicedAmount,
        type,
      },
    };
  }
}
