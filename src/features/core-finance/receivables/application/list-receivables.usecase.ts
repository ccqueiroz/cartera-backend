import { TransactionTypeEnum } from '@/shared/kernel/enums/transaction-type.enum';
import { Page } from '@/shared/query/page';
import { TransactionOutput } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import {
  ListScope,
  ListTransactionsInput,
} from '@/features/core-finance/transaction-engine/application/list-transactions.usecase';
import { TransactionEngine } from '@/features/core-finance/transaction-engine/transaction-engine.factory';

export interface ListReceivablesInput {
  userId: string;
  scope: ListScope;
  month?: number;
  year?: number;
  categoryDescriptionEnum?: string;
  paymentMethodDescriptionEnum?: string;
  rootHasInstallments?: boolean;
  rootIsFixedCost?: boolean;
  page?: number;
  size?: number;
}

/** UC-RV3: lista folhas RECEIVABLES por competência, delegando ao motor (folhas, type fixo). */
export class ListReceivablesUseCase {
  private constructor(private readonly engine: TransactionEngine) {}

  public static create(engine: TransactionEngine): ListReceivablesUseCase {
    return new ListReceivablesUseCase(engine);
  }

  public async execute(
    input: ListReceivablesInput,
  ): Promise<Page<TransactionOutput>> {
    const query: ListTransactionsInput = {
      userId: input.userId,
      scope: input.scope,
      type: TransactionTypeEnum.RECEIVABLES,
      month: input.month,
      year: input.year,
      categoryDescriptionEnum: input.categoryDescriptionEnum,
      paymentMethodDescriptionEnum: input.paymentMethodDescriptionEnum,
      rootHasInstallments: input.rootHasInstallments,
      rootIsFixedCost: input.rootIsFixedCost,
      page: input.page,
      size: input.size,
    };
    return this.engine.list.execute(query);
  }
}
