import { Wallet, WalletOutput } from '@/features/wallet/domain/wallet.entity';
import {
  WalletMovement,
  WalletMovementOutput,
} from '@/features/wallet/domain/wallet-movement.entity';
import {
  WalletMovementDirectionEnum,
  WalletMovementRefTypeEnum,
} from '@/features/wallet/domain/enums/wallet-movement.enums';
import { WalletRepository } from '@/features/wallet/domain/ports/wallet.repository.port';
import { FinancialIndicatorGateway } from '@/features/wallet/domain/ports/financial-indicator.gateway.port';
import { computeAccruedInterest } from '@/features/wallet/application/compute-accrued-interest';
import {
  collectBalanceWarnings,
  WalletWarning,
} from '@/features/wallet/domain/wallet-warnings';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import {
  DuplicateEntityError,
  EntityNotFoundError,
  ValidationError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export enum WalletAdjustOperation {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

interface AdjustBalanceInput {
  userId: string;
  id: string;
  operation: WalletAdjustOperation;
  amount: number;
  occurredAt?: string;
}

export interface AdjustBalanceResult {
  wallet: WalletOutput;
  movements: WalletMovementOutput[];
  warnings: WalletWarning[];
}

export class AdjustBalanceUseCase {
  private constructor(
    private readonly repository: WalletRepository,
    private readonly indicatorGateway: FinancialIndicatorGateway,
    private readonly generateId: () => string,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: WalletRepository,
    indicatorGateway: FinancialIndicatorGateway,
    generateId: () => string,
    now: () => string,
  ): AdjustBalanceUseCase {
    return new AdjustBalanceUseCase(
      repository,
      indicatorGateway,
      generateId,
      now,
    );
  }

  public async execute(
    input: AdjustBalanceInput,
  ): Promise<AdjustBalanceResult> {
    if (!(input.amount > 0))
      throw new ValidationError(ErrorCode.INVALID_WALLET_ADJUST_AMOUNT);

    const wallet = await this.loadOwned(input.id, input.userId);
    const timestamp = this.now();
    const occurredAt = input.occurredAt ?? timestamp.slice(0, 10);
    const amount = Money.create(input.amount);
    const movements: WalletMovement[] = [];

    if (input.operation === WalletAdjustOperation.WITHDRAW) {
      wallet.debit(amount, occurredAt, timestamp);
      movements.push(
        this.movement(wallet, {
          direction: WalletMovementDirectionEnum.DEBIT,
          amount,
          refType: WalletMovementRefTypeEnum.ADJUST,
          occurredAt,
          timestamp,
        }),
      );
    } else {
      await this.capitalizeInterest(wallet, movements, occurredAt, timestamp);
      wallet.credit(amount, timestamp);
      movements.push(
        this.movement(wallet, {
          direction: WalletMovementDirectionEnum.CREDIT,
          amount,
          refType: WalletMovementRefTypeEnum.ADJUST,
          occurredAt,
          timestamp,
        }),
      );
      if (!wallet.balance.isNegative()) wallet.closeOverdraftEpisode();
    }

    await this.repository.saveWithMovements(wallet, movements);

    return {
      wallet: wallet.toOutput(),
      movements: movements.map((movement) => movement.toOutput()),
      warnings: collectBalanceWarnings({
        isNegative: wallet.balance.isNegative(),
        exceedsLimit: wallet.exceedsOverdraftLimit(),
      }),
    };
  }

  /** Juros antes do principal (W14): capitaliza o acumulado como movimento interno e reinicia o relógio do episódio. */
  private async capitalizeInterest(
    wallet: Wallet,
    movements: WalletMovement[],
    occurredAt: string,
    timestamp: string,
  ): Promise<void> {
    if (wallet.overdraftSince === null) return;
    const existing = await this.repository.listMovements(
      wallet.id,
      wallet.userId,
    );
    const iofDailyRate = await this.indicatorGateway.getActiveIofDailyRate();
    const accrued = computeAccruedInterest({
      wallet,
      movements: existing,
      today: occurredAt,
      iofDailyRate,
    });
    if (accrued <= 0) return;

    const interest = Money.create(accrued);
    wallet.debit(interest, occurredAt, timestamp);
    movements.push(
      this.movement(wallet, {
        direction: WalletMovementDirectionEnum.DEBIT,
        amount: interest,
        refType: WalletMovementRefTypeEnum.OVERDRAFT_INTEREST,
        occurredAt,
        timestamp,
      }),
    );
    wallet.restartOverdraftEpisode(occurredAt);
  }

  private movement(
    wallet: Wallet,
    input: {
      direction: WalletMovementDirectionEnum;
      amount: Money;
      refType: WalletMovementRefTypeEnum;
      occurredAt: string;
      timestamp: string;
    },
  ): WalletMovement {
    return WalletMovement.create({
      id: this.generateId(),
      userId: wallet.userId,
      walletId: wallet.id,
      direction: input.direction,
      amount: input.amount,
      refType: input.refType,
      refId: null,
      occurredAt: input.occurredAt,
      createdAt: input.timestamp,
    });
  }

  private async loadOwned(id: string, userId: string): Promise<Wallet> {
    const wallet = await this.repository.findById(id, userId);
    if (!wallet) throw new EntityNotFoundError(ErrorCode.WALLET_NOT_FOUND);
    if (!wallet.isActive)
      throw new DuplicateEntityError(ErrorCode.WALLET_DELETED);
    return wallet;
  }
}
