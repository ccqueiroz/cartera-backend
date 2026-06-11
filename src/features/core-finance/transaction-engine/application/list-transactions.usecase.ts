import { TransactionOutput } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import {
  ListTransactionsQuery,
  TransactionTreeRepository,
} from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';
import { PaymentStatusEnum } from '@/shared/kernel/enums/payment-status.enum';
import { TransactionType } from '@/shared/kernel/enums/transaction-type.enum';
import { applySort, SortCriteria } from '@/shared/query/apply-sort';
import { applyPagination } from '@/shared/query/apply-pagination';
import { Page } from '@/shared/query/page';

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
    const leaves = await this.repository.listLeaves(this.toQuery(input));
    const sorted = applySort(
      leaves.map((leaf) => leaf.toOutput()),
      input.sort,
    );
    return applyPagination(sorted, input.page, input.size);
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
