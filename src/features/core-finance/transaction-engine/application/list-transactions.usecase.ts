import { TransactionOutput } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { TransactionTreeRepository } from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';

export type ListScope = 'to_pay' | 'paid';

export interface ListTransactionsInput {
  scope: ListScope;
  rootId?: string;
  month?: number;
  year?: number;
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
  ): Promise<TransactionOutput[]> {
    const paid = input.scope === 'paid';
    const leaves = await this.repository.listLeaves({
      rootId: input.rootId,
      paid,
      ...(paid
        ? {
            refMonthPaymentDate: input.month,
            refYearPaymentDate: input.year,
          }
        : {
            refMonthDueDate: input.month,
            refYearDueDate: input.year,
          }),
    });
    return leaves.map((leaf) => leaf.toOutput());
  }
}
