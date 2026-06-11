import { TransactionOutput } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { TransactionTreeRepository } from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';
import { TransactionNotFoundError } from '@/features/core-finance/transaction-engine/domain/errors/transaction-not-found.error';

export interface TransactionDetail {
  node: TransactionOutput;
  children: TransactionOutput[];
}

/** UC-04: nó + filhas imediatas (lazy). Nó deletado → 404 (igual a inexistente). */
export class GetTransactionByIdUseCase {
  private constructor(private readonly repository: TransactionTreeRepository) {}

  public static create(
    repository: TransactionTreeRepository,
  ): GetTransactionByIdUseCase {
    return new GetTransactionByIdUseCase(repository);
  }

  public async execute(id: string, userId: string): Promise<TransactionDetail> {
    const node = await this.repository.findActiveById(id, userId);
    if (!node) throw new TransactionNotFoundError();

    const children = await this.repository.findChildren(id);
    return {
      node: node.toOutput(),
      children: children.map((child) => child.toOutput()),
    };
  }
}
