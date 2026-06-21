import { Money } from '@/shared/kernel/value-objects/money.vo';
import { collectBalanceWarnings } from '@/shared/kernel/value-objects/balance-warnings';
import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { AtomicRunner } from '@/shared/database/atomic-runner';
import { TransactionEngine } from '@/features/core-finance/transaction-engine/transaction-engine.factory';
import {
  WalletMovementSpec,
  WalletGateway,
} from '@/features/core-finance/shared/ports/wallet.gateway.port';
import { SettleBillResult } from '@/features/core-finance/bills/application/bill-response';

export interface SettleBillInput {
  id: string;
  userId: string;
  walletId: string;
  paidAmount: number;
  paymentDate: string;
  paymentMethodDescriptionEnum: string;
}

/**
 * UC-B5: liquida uma folha em bloco atômico (B1/B2) — folha paga + rollup (motor)
 * + débito na wallet + `WalletMovement(DEBIT, SETTLEMENT)`, tudo num único
 * `AtomicRunner.run`. A wallet é lida fora da transação (snapshot) e só escrita
 * dentro dela, depois das leituras transacionais do motor (reads-before-writes).
 */
export class SettleBillUseCase {
  private constructor(
    private readonly engine: TransactionEngine,
    private readonly walletGateway: WalletGateway,
    private readonly atomicRunner: AtomicRunner,
    private readonly generateId: () => string,
    private readonly now: () => string,
  ) {}

  public static create(
    engine: TransactionEngine,
    walletGateway: WalletGateway,
    atomicRunner: AtomicRunner,
    generateId: () => string,
    now: () => string,
  ): SettleBillUseCase {
    return new SettleBillUseCase(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    );
  }

  public async execute(input: SettleBillInput): Promise<SettleBillResult> {
    const snapshot = await this.walletGateway.findActiveSnapshot(
      input.walletId,
      input.userId,
    );
    if (!snapshot)
      throw new EntityNotFoundError(ErrorCode.WALLET_NOT_FOUND, {
        walletId: input.walletId,
      });

    const amount = Money.create(input.paidAmount);
    const createdAt = this.now();

    const root = await this.atomicRunner.run(async (ctx) => {
      const settledRoot = await this.engine.settle.executeTx(ctx, {
        id: input.id,
        userId: input.userId,
        paymentDate: input.paymentDate,
        paidAmount: input.paidAmount,
        paymentMethodDescriptionEnum: input.paymentMethodDescriptionEnum,
      });

      snapshot.debit(amount, input.paymentDate);
      const movement: WalletMovementSpec = {
        id: this.generateId(),
        userId: input.userId,
        walletId: input.walletId,
        direction: 'DEBIT',
        amount: input.paidAmount,
        refType: 'SETTLEMENT',
        refId: input.id,
        occurredAt: input.paymentDate,
        createdAt,
      };
      await this.walletGateway.persistSettlement(ctx, snapshot, [movement]);
      return settledRoot;
    });

    return {
      root: root.toOutput(),
      wallet: { id: input.walletId, balance: snapshot.balance.value },
      warnings: collectBalanceWarnings({
        isNegative: snapshot.isNegative(),
        exceedsLimit: snapshot.exceedsOverdraftLimit(),
      }),
    };
  }
}
