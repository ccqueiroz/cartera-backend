import { Transaction } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { TransactionTreeRepository } from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';
import { TransactionNotFoundError } from '@/features/core-finance/transaction-engine/domain/errors/transaction-not-found.error';

/**
 * UC-09 estorno: snapshot em `paymentHistory`, desfaz a quitação, `reversed=true`;
 * a mãe reabre (`IN_PROGRESS`) pelo rollup. Guardas de domínio na entidade:
 * estorno 2x, estornar não-pago, estornar a entrada, estornar nó interno.
 *
 * Gancho D24 (recortado): a perna cartão↔conta — devolver limite ao cartão e
 * debitar/creditar a conta de forma atômica — entra quando `credit-card`/`account`
 * existirem. Molde de referência: liquidação coordenada por use case com gateways
 * injetados (`CreditCardGateway`/`AccountGateway`), CLAUDE.md §6. Não implementado
 * aqui: este UC entrega só o estorno intrínseco à árvore.
 */
export class ReverseTransactionUseCase {
  private constructor(
    private readonly repository: TransactionTreeRepository,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: TransactionTreeRepository,
    now: () => string,
  ): ReverseTransactionUseCase {
    return new ReverseTransactionUseCase(repository, now);
  }

  public async execute(id: string, userId: string): Promise<Transaction> {
    const node = await this.repository.findActiveById(id, userId);
    if (!node) throw new TransactionNotFoundError();

    const reversedAt = this.now();
    return this.repository.mutateAndRollup(id, (target) =>
      target.reverse(reversedAt),
    );
  }
}
