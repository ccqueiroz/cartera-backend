import { TransactionOutput } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { TransactionEngine } from '@/features/core-finance/transaction-engine/transaction-engine.factory';

export interface EditReceivableInput {
  id: string;
  userId: string;
  amount?: number;
  dueDate?: string;
  categoryDescriptionEnum?: string;
  propagate?: boolean;
}

/** UC-RV7: edita a receita, delegando `EditTransaction` (propagação D19). */
export class EditReceivableUseCase {
  private constructor(private readonly engine: TransactionEngine) {}

  public static create(engine: TransactionEngine): EditReceivableUseCase {
    return new EditReceivableUseCase(engine);
  }

  public async execute(input: EditReceivableInput): Promise<TransactionOutput> {
    const updated = await this.engine.edit.execute(input);
    return updated.toOutput();
  }
}
