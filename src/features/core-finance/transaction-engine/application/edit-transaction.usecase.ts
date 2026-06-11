import { Money } from '@/shared/kernel/value-objects/money.vo';
import { Transaction } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { TransactionTreeRepository } from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';
import { CategoryGateway } from '@/features/core-finance/transaction-engine/domain/ports/category.gateway.port';
import { TransactionNotFoundError } from '@/features/core-finance/transaction-engine/domain/errors/transaction-not-found.error';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import {
  addMonths,
  monthDelta,
} from '@/features/core-finance/transaction-engine/domain/installment-date.util';

export interface EditTransactionInput {
  id: string;
  userId: string;
  amount?: number;
  dueDate?: string;
  categoryDescriptionEnum?: string;
  /** Propaga dueDate (cadência mensal) e categoria às filhas NÃO pagas. */
  propagate?: boolean;
}

export class EditTransactionUseCase {
  private constructor(
    private readonly repository: TransactionTreeRepository,
    private readonly categoryGateway: CategoryGateway,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: TransactionTreeRepository,
    categoryGateway: CategoryGateway,
    now: () => string,
  ): EditTransactionUseCase {
    return new EditTransactionUseCase(repository, categoryGateway, now);
  }

  public async execute(input: EditTransactionInput): Promise<Transaction> {
    const node = await this.repository.findActiveById(input.id, input.userId);
    if (!node) throw new TransactionNotFoundError();

    const category = await this.resolveCategory(input.categoryDescriptionEnum);
    const updatedAt = this.now();

    if (input.propagate && node.hasChildren) {
      await this.propagateToUnpaidChildren(node, input, category, updatedAt);
    }

    return this.repository.mutateAndRollup(input.id, (target) =>
      target.edit({
        amount:
          input.amount !== undefined ? Money.create(input.amount) : undefined,
        dueDate: input.dueDate,
        categoryDescriptionEnum: category?.descriptionEnum,
        categoryGroup: category?.group,
        updatedAt,
      }),
    );
  }

  private async propagateToUnpaidChildren(
    mother: Transaction,
    input: EditTransactionInput,
    category: { descriptionEnum: string; group: string } | null,
    updatedAt: string,
  ): Promise<void> {
    const delta =
      input.dueDate !== undefined
        ? monthDelta(mother.dueDate, input.dueDate)
        : 0;

    const children = await this.repository.findChildren(mother.id);
    const edited = children
      .filter((child) => !child.paid)
      .map((child) => {
        child.edit({
          dueDate:
            input.dueDate !== undefined
              ? addMonths(child.dueDate, delta)
              : undefined,
          categoryDescriptionEnum: category?.descriptionEnum,
          categoryGroup: category?.group,
          updatedAt,
        });
        return child;
      });

    // Gap ADR-05 deliberado: esta gravação das filhas e o `mutateAndRollup` da mãe
    // (execute) são 2 writes separados, não 1 `runTransaction`. Inofensivo enquanto
    // não há consumidor/concorrência — a propagação só toca dueDate/categoria, que
    // não entram no rollup. Unificar (ex.: `mutateManyAndRollup`) quando
    // bills/receivables consumirem o engine.
    if (edited.length > 0) await this.repository.saveMany(edited);
  }

  private async resolveCategory(descriptionEnum?: string) {
    if (!descriptionEnum) return null;
    const resolved = await this.categoryGateway.resolve(descriptionEnum);
    if (!resolved)
      throw new ValidationError(ErrorCode.CATEGORY_NOT_FOUND, {
        descriptionEnum,
      });
    return resolved;
  }
}
