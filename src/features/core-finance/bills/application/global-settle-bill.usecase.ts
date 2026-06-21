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

export interface GlobalSettleBillInput {
  nodeId: string;
  userId: string;
  walletId: string;
  paymentDate: string;
  paymentMethodDescriptionEnum: string;
  selection?: string[];
  valorPago?: number;
}

/**
 * UC-B6: quitação global em bloco atômico — `GlobalSettlement` (rateio Hamilton)
 * dentro do `AtomicRunner`, um único débito pelo total efetivo + um
 * `WalletMovement(SETTLEMENT)` por folha settlada (rastreio fino por `refId`).
 */
export class GlobalSettleBillUseCase {
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
  ): GlobalSettleBillUseCase {
    return new GlobalSettleBillUseCase(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    );
  }

  public async execute(
    input: GlobalSettleBillInput,
  ): Promise<SettleBillResult> {
    const snapshot = await this.walletGateway.findActiveSnapshot(
      input.walletId,
      input.userId,
    );
    if (!snapshot)
      throw new EntityNotFoundError(ErrorCode.WALLET_NOT_FOUND, {
        walletId: input.walletId,
      });

    const createdAt = this.now();

    await this.atomicRunner.run(async (ctx) => {
      const result = await this.engine.globalSettlement.executeTx(ctx, {
        nodeId: input.nodeId,
        userId: input.userId,
        paymentDate: input.paymentDate,
        paymentMethodDescriptionEnum: input.paymentMethodDescriptionEnum,
        selection: input.selection,
        valorPago: input.valorPago,
      });
      if (result.settledAmounts.length === 0) return;

      const total = result.settledAmounts.reduce(
        (acc, a) => acc.add(Money.create(a.paidAmount)),
        Money.create(0),
      );
      snapshot.debit(total, input.paymentDate);

      const movements: WalletMovementSpec[] = result.settledAmounts.map(
        (a) => ({
          id: this.generateId(),
          userId: input.userId,
          walletId: input.walletId,
          direction: 'DEBIT',
          amount: a.paidAmount,
          refType: 'SETTLEMENT',
          refId: a.leafId,
          occurredAt: input.paymentDate,
          createdAt,
        }),
      );
      await this.walletGateway.persistSettlement(ctx, snapshot, movements);
    });

    const detail = await this.engine.getById.execute(
      input.nodeId,
      input.userId,
    );
    return {
      root: detail.node,
      wallet: { id: input.walletId, balance: snapshot.balance.value },
      warnings: collectBalanceWarnings({
        isNegative: snapshot.isNegative(),
        exceedsLimit: snapshot.exceedsOverdraftLimit(),
      }),
    };
  }
}
