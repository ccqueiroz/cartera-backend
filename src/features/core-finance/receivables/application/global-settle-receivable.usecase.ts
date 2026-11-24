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
import { SettleReceivableResult } from '@/features/core-finance/receivables/application/receivable-response';

export interface GlobalSettleReceivableInput {
  nodeId: string;
  userId: string;
  walletId: string;
  paymentDate: string;
  paymentMethodDescriptionEnum: string;
  selection?: string[];
  valorPago?: number;
}

/**
 * UC-RV6: recebimento global em bloco atômico — `GlobalSettlement` (rateio
 * Hamilton) dentro do `AtomicRunner`, um único **crédito** pelo total efetivo +
 * um `WalletMovement(CREDIT, SETTLEMENT)` por folha settlada (rastreio fino por
 * `refId`).
 */
export class GlobalSettleReceivableUseCase {
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
  ): GlobalSettleReceivableUseCase {
    return new GlobalSettleReceivableUseCase(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    );
  }

  public async execute(
    input: GlobalSettleReceivableInput,
  ): Promise<SettleReceivableResult> {
    const createdAt = this.now();

    const wallet = await this.atomicRunner.run(async (ctx) => {
      const wallet = await this.walletGateway.loadWalletTx(
        ctx,
        input.walletId,
        input.userId,
      );
      if (!wallet)
        throw new EntityNotFoundError(ErrorCode.WALLET_NOT_FOUND, {
          walletId: input.walletId,
        });

      const result = await this.engine.globalSettlement.executeTx(ctx, {
        nodeId: input.nodeId,
        userId: input.userId,
        paymentDate: input.paymentDate,
        paymentMethodDescriptionEnum: input.paymentMethodDescriptionEnum,
        selection: input.selection,
        valorPago: input.valorPago,
      });
      if (result.settledAmounts.length === 0) return wallet;

      const total = result.settledAmounts.reduce(
        (acc, a) => acc.add(Money.create(a.paidAmount)),
        Money.create(0),
      );
      wallet.credit(total, createdAt);
      wallet.closeOverdraftEpisode();

      const movements: WalletMovementSpec[] = result.settledAmounts.map(
        (a) => ({
          id: this.generateId(),
          userId: input.userId,
          walletId: input.walletId,
          direction: 'CREDIT',
          amount: a.paidAmount,
          refType: 'SETTLEMENT',
          refId: a.leafId,
          occurredAt: input.paymentDate,
          createdAt,
        }),
      );
      await this.walletGateway.saveWalletTx(ctx, wallet, movements);
      return wallet;
    });

    const detail = await this.engine.getById.execute(
      input.nodeId,
      input.userId,
    );
    return {
      root: detail.node,
      wallet: { id: input.walletId, balance: wallet.balance.value },
      warnings: collectBalanceWarnings({
        isNegative: wallet.balance.isNegative(),
        exceedsLimit: wallet.exceedsOverdraftLimit(),
      }),
    };
  }
}
