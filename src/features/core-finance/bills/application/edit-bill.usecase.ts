import { TransactionOutput } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { TransactionEngine } from '@/features/core-finance/transaction-engine/transaction-engine.factory';

export interface EditBillInput {
  id: string;
  userId: string;
  amount?: number;
  dueDate?: string;
  categoryDescriptionEnum?: string;
  propagate?: boolean;
}

/** UC-B7: edita a despesa, delegando `EditTransaction` (propagação D19). */
export class EditBillUseCase {
  private constructor(private readonly engine: TransactionEngine) {}

  public static create(engine: TransactionEngine): EditBillUseCase {
    return new EditBillUseCase(engine);
  }

  public async execute(input: EditBillInput): Promise<TransactionOutput> {
    const updated = await this.engine.edit.execute(input);
    return updated.toOutput();
  }
}
