import { TransactionEngine } from '@/features/core-finance/transaction-engine/transaction-engine.factory';

/**
 * UC-RV8: soft-delete (cascata, recálculo até a raiz), delegando ao motor. NÃO
 * mexe em caixa: movimentos de folhas recebidas permanecem (histórico); acerto de
 * saldo é por estorno prévio ou ajuste manual (regra de apresentação).
 */
export class SoftDeleteReceivableUseCase {
  private constructor(private readonly engine: TransactionEngine) {}

  public static create(engine: TransactionEngine): SoftDeleteReceivableUseCase {
    return new SoftDeleteReceivableUseCase(engine);
  }

  public async execute(id: string, userId: string): Promise<void> {
    await this.engine.softDelete.execute(id, userId);
  }
}
