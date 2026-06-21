import {
  TransactionDetail,
  GetTransactionByIdUseCase,
} from '@/features/core-finance/transaction-engine/application/get-transaction-by-id.usecase';
import { TransactionEngine } from '@/features/core-finance/transaction-engine/transaction-engine.factory';

/** UC-B4: nó + filhas imediatas (lazy), escopado no userId. Delega ao motor. */
export class GetBillByIdUseCase {
  private constructor(private readonly getById: GetTransactionByIdUseCase) {}

  public static create(engine: TransactionEngine): GetBillByIdUseCase {
    return new GetBillByIdUseCase(engine.getById);
  }

  public async execute(id: string, userId: string): Promise<TransactionDetail> {
    return this.getById.execute(id, userId);
  }
}
