import { TransactionOutput } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { TransactionTreeRepository } from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';

/** Listagem de auditoria: só nós deletados, read-only, isolada da query padrão. */
export class ListDeletedTransactionsUseCase {
  private constructor(private readonly repository: TransactionTreeRepository) {}

  public static create(
    repository: TransactionTreeRepository,
  ): ListDeletedTransactionsUseCase {
    return new ListDeletedTransactionsUseCase(repository);
  }

  public async execute(rootId?: string): Promise<TransactionOutput[]> {
    const deleted = await this.repository.listDeleted(rootId);
    return deleted.map((node) => node.toOutput());
  }
}
