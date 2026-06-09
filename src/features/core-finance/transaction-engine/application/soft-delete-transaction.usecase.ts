import { TransactionTreeRepository } from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';
import { TransactionNotFoundError } from '@/features/core-finance/transaction-engine/domain/errors/transaction-not-found.error';

/**
 * UC-07: soft delete em cascata (D11). Permitido em qualquer nível, inclusive
 * raiz e folha paga (D28). Recalcula os ancestrais até a raiz.
 */
export class SoftDeleteTransactionUseCase {
  private constructor(
    private readonly repository: TransactionTreeRepository,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: TransactionTreeRepository,
    now: () => string,
  ): SoftDeleteTransactionUseCase {
    return new SoftDeleteTransactionUseCase(repository, now);
  }

  public async execute(id: string): Promise<void> {
    const node = await this.repository.findActiveById(id);
    if (!node) throw new TransactionNotFoundError();
    await this.repository.softDeleteSubtreeAndRollup(id, this.now());
  }
}
