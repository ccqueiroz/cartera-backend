import { TransactionOutput } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import {
  ListTransactionsQuery,
  TransactionTreeRepository,
} from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';
import { PaymentStatusEnum } from '@/shared/kernel/enums/payment-status.enum';
import { TransactionType } from '@/shared/kernel/enums/transaction-type.enum';
import { TransactionOrigin } from '@/shared/kernel/enums/transaction-origin.enum';
import {
  applySort,
  SortCriteria,
  SortField,
} from '@/features/core-finance/transaction-engine/domain/apply-sort';
import { applyPagination } from '@/shared/query/apply-pagination';
import { Page, PaginationParams, SortOrder } from '@/shared/query/page';

export type ListScope = 'to_pay' | 'paid';

export interface ListTransactionsInput {
  userId: string;
  scope: ListScope;
  rootId?: string;
  month?: number;
  year?: number;
  type?: TransactionType;
  categoryDescriptionEnum?: string;
  paymentStatus?: PaymentStatusEnum;
  paymentMethodDescriptionEnum?: string;
  rootHasInstallments?: boolean;
  rootIsFixedCost?: boolean;
  origin?: TransactionOrigin;
  originNotIn?: TransactionOrigin[];
  dueDateFrom?: string;
  dueDateTo?: string;
  paymentDateFrom?: string;
  paymentDateTo?: string;
  amountMin?: number;
  amountMax?: number;
  paidAmountMin?: number;
  paidAmountMax?: number;
  sort?: SortCriteria;
  page?: number;
  size?: number;
  params?: PaginationParams;
}

export class ListTransactionsUseCase {
  private constructor(private readonly repository: TransactionTreeRepository) {}

  public static create(
    repository: TransactionTreeRepository,
  ): ListTransactionsUseCase {
    return new ListTransactionsUseCase(repository);
  }

  public async execute(
    input: ListTransactionsInput,
  ): Promise<Page<TransactionOutput>> {
    const { params } = input;
    const ordering = params?.ordering ?? null;
    const page = input.page ?? params?.page;
    const size = input.size ?? params?.size;
    const ownFilters: Record<string, unknown> = { ...input };
    const sortFilter = params?.sort;
    if (
      sortFilter &&
      ownFilters[sortFilter.field] !== undefined &&
      ownFilters[sortFilter.field] !== sortFilter.value
    ) {
      return applyPagination([], page, size, ordering);
    }

    const leaves = await this.repository.listLeaves(
      this.toQuery(this.withParams(input)),
    );
    const sorted = applySort(
      leaves.map((leaf) => leaf.toOutput()),
      this.toSortCriteria(input),
    );
    return applyPagination(sorted, page, size, ordering);
  }

  private toSortCriteria(
    input: ListTransactionsInput,
  ): SortCriteria | undefined {
    const [requested] = Object.entries(input.params?.ordering ?? {});
    if (!requested) return input.sort;
    const [field, order] = requested;
    return {
      field: field as SortField,
      direction: order === SortOrder.DESC ? 'DESC' : 'ASC',
    };
  }

  private withParams(input: ListTransactionsInput): ListTransactionsInput {
    const { sort, searchByDate } = input.params ?? {};
    const withFilter = sort ? { ...input, [sort.field]: sort.value } : input;
    if (
      !searchByDate ||
      (searchByDate.field !== 'dueDate' && searchByDate.field !== 'paymentDate')
    ) {
      return withFilter;
    }
    const from = searchByDate.initialDate ?? searchByDate.exactlyDate;
    const to = searchByDate.finalDate ?? searchByDate.exactlyDate;
    const fromKey = `${searchByDate.field}From` as const;
    const toKey = `${searchByDate.field}To` as const;
    const ownFrom = withFilter[fromKey];
    const ownTo = withFilter[toKey];
    return {
      ...withFilter,
      [fromKey]:
        from && ownFrom ? (from > ownFrom ? from : ownFrom) : from ?? ownFrom,
      [toKey]: to && ownTo ? (to < ownTo ? to : ownTo) : to ?? ownTo,
    };
  }

  private toQuery(input: ListTransactionsInput): ListTransactionsQuery {
    const paid = input.scope === 'paid';
    const periodRefs = paid
      ? { refMonthPaymentDate: input.month, refYearPaymentDate: input.year }
      : { refMonthDueDate: input.month, refYearDueDate: input.year };

    return {
      userId: input.userId,
      paid,
      rootId: input.rootId,
      type: input.type,
      categoryDescriptionEnum: input.categoryDescriptionEnum,
      paymentStatus: input.paymentStatus,
      paymentMethodDescriptionEnum: input.paymentMethodDescriptionEnum,
      rootHasInstallments: input.rootHasInstallments,
      rootIsFixedCost: input.rootIsFixedCost,
      origin: input.origin,
      originNotIn: input.originNotIn,
      ...periodRefs,
      dueDateFrom: input.dueDateFrom,
      dueDateTo: input.dueDateTo,
      paymentDateFrom: input.paymentDateFrom,
      paymentDateTo: input.paymentDateTo,
      amountMin: input.amountMin,
      amountMax: input.amountMax,
      paidAmountMin: input.paidAmountMin,
      paidAmountMax: input.paidAmountMax,
      sort: input.sort,
      page: input.page,
      size: input.size,
    };
  }
}
