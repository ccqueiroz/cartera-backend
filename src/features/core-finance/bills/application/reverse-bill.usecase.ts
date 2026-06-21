import { Money } from '@/shared/kernel/value-objects/money.vo';
import { collectBalanceWarnings } from '@/shared/kernel/value-objects/balance-warnings';
import {
  BusinessRuleViolationError,
  EntityNotFoundError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { AtomicRunner } from '@/shared/database/atomic-runner';
import { TransactionEngine } from '@/features/core-finance/transaction-engine/transaction-engine.factory';
import {
  BillWalletMovementSpec,
  WalletGateway,
} from '@/features/core-finance/bills/domain/ports/wallet.gateway.port';
import { SettleBillResult } from '@/features/core-finance/bills/application/bill-response';

export interface ReverseBillInput {
  id: string;
  userId: string;
}

/**
 * UC-B9: estorna uma folha paga em bloco atômico — `engine.reverse` (snapshot em
 * `paymentHistory`) + crédito de volta na wallet do **movimento original** +
 * `WalletMovement(SETTLEMENT_REVERSAL, CREDIT)` (B3). A wallet de devolução é
 * localizada pelo movimento `SETTLEMENT` rastreável (`refId = folha`); sem ele →
 * `SETTLEMENT_MOVEMENT_NOT_FOUND` (422).
 */
export class ReverseBillUseCase {
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
  ): ReverseBillUseCase {
    return new ReverseBillUseCase(
      engine,
      walletGateway,
      atomicRunner,
      generateId,
      now,
    );
  }

  public async execute(input: ReverseBillInput): Promise<SettleBillResult> {
    const movementRef = await this.walletGateway.findSettlementMovement(
      input.id,
      input.userId,
    );
    if (!movementRef)
      throw new BusinessRuleViolationError(
        ErrorCode.SETTLEMENT_MOVEMENT_NOT_FOUND,
        { leafId: input.id },
      );

    const snapshot = await this.walletGateway.findActiveSnapshot(
      movementRef.walletId,
      input.userId,
    );
    if (!snapshot)
      throw new EntityNotFoundError(ErrorCode.WALLET_NOT_FOUND, {
        walletId: movementRef.walletId,
      });

    const amount = Money.create(movementRef.amount);
    const occurredAt = this.now();
    const occurredDate = occurredAt.slice(0, 10);

    const root = await this.atomicRunner.run(async (ctx) => {
      const reversedRoot = await this.engine.reverse.executeTx(
        ctx,
        input.id,
        input.userId,
      );

      snapshot.credit(amount);
      const movement: BillWalletMovementSpec = {
        id: this.generateId(),
        userId: input.userId,
        walletId: movementRef.walletId,
        direction: 'CREDIT',
        amount: movementRef.amount,
        refType: 'SETTLEMENT_REVERSAL',
        refId: input.id,
        occurredAt: occurredDate,
        createdAt: occurredAt,
      };
      await this.walletGateway.persistSettlement(ctx, snapshot, [movement]);
      return reversedRoot;
    });

    return {
      root: root.toOutput(),
      wallet: { id: movementRef.walletId, balance: snapshot.balance.value },
      warnings: collectBalanceWarnings({
        isNegative: snapshot.isNegative(),
        exceedsLimit: snapshot.exceedsOverdraftLimit(),
      }),
    };
  }
}
