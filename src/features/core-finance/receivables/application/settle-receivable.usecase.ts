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

export interface SettleReceivableInput {
  id: string;
  userId: string;
  walletId: string;
  paidAmount: number;
  paymentDate: string;
  paymentMethodDescriptionEnum: string;
}

/**
 * UC-RV5: recebe uma folha em bloco atômico — folha recebida + rollup (motor) +
 * **crédito** na wallet + `WalletMovement(CREDIT, SETTLEMENT)`, tudo num único
 * `AtomicRunner.run`. A wallet é lida dentro da transação, antes das leituras do
 * motor, e só escrita depois delas (reads-before-writes).
 * Receber credita → nunca negativa → sem warning de saldo.
 */
export class SettleReceivableUseCase {
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
  ): SettleReceivableUseCase {
    return new SettleReceivableUseCase(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    );
  }

  public async execute(
    input: SettleReceivableInput,
  ): Promise<SettleReceivableResult> {
    const amount = Money.create(input.paidAmount);
    const createdAt = this.now();

    const { root, wallet } = await this.atomicRunner.run(async (ctx) => {
      const wallet = await this.walletGateway.loadWalletTx(
        ctx,
        input.walletId,
        input.userId,
      );
      if (!wallet)
        throw new EntityNotFoundError(ErrorCode.WALLET_NOT_FOUND, {
          walletId: input.walletId,
        });

      const settledRoot = await this.engine.settle.executeTx(ctx, {
        id: input.id,
        userId: input.userId,
        paymentDate: input.paymentDate,
        paidAmount: input.paidAmount,
        paymentMethodDescriptionEnum: input.paymentMethodDescriptionEnum,
      });

      wallet.credit(amount, createdAt);
      wallet.closeOverdraftEpisode();
      const movement: WalletMovementSpec = {
        id: this.generateId(),
        userId: input.userId,
        walletId: input.walletId,
        direction: 'CREDIT',
        amount: input.paidAmount,
        refType: 'SETTLEMENT',
        refId: input.id,
        occurredAt: input.paymentDate,
        createdAt,
      };
      await this.walletGateway.saveWalletTx(ctx, wallet, [movement]);
      return { root: settledRoot, wallet };
    });

    return {
      root: root.toOutput(),
      wallet: { id: input.walletId, balance: wallet.balance.value },
      warnings: collectBalanceWarnings({
        isNegative: wallet.balance.isNegative(),
        exceedsLimit: wallet.exceedsOverdraftLimit(),
      }),
    };
  }
}
