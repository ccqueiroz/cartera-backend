import { Wallet, WalletOutput } from '@/features/wallet/domain/wallet.entity';
import { WalletMovement } from '@/features/wallet/domain/wallet-movement.entity';
import {
  WalletMovementDirectionEnum,
  WalletMovementRefTypeEnum,
} from '@/features/wallet/domain/enums/wallet-movement.enums';
import { WalletRepository } from '@/features/wallet/domain/ports/wallet.repository.port';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import {
  collectBalanceWarnings,
  WalletWarning,
} from '@/features/wallet/domain/wallet-warnings';

interface CreateWalletInput {
  userId: string;
  name: string;
  balance?: number;
  hasOverdraft?: boolean;
  overdraftLimit?: number;
  overdraftMonthlyRate?: number;
  overdraftGraceDays?: number;
}

export interface CreateWalletResult {
  wallet: WalletOutput;
  warnings: WalletWarning[];
}

export class CreateWalletUseCase {
  private constructor(
    private readonly repository: WalletRepository,
    private readonly generateId: () => string,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: WalletRepository,
    generateId: () => string,
    now: () => string,
  ): CreateWalletUseCase {
    return new CreateWalletUseCase(repository, generateId, now);
  }

  public async execute(input: CreateWalletInput): Promise<CreateWalletResult> {
    const createdAt = this.now();
    const occurredAt = createdAt.slice(0, 10);
    const wallet = Wallet.create({
      id: this.generateId(),
      userId: input.userId,
      name: input.name,
      balance: input.balance ?? 0,
      createdAt,
      hasOverdraft: input.hasOverdraft,
      overdraftLimit: input.overdraftLimit,
      overdraftMonthlyRate: input.overdraftMonthlyRate,
      overdraftGraceDays: input.overdraftGraceDays,
    });

    const movements: WalletMovement[] = [];
    const initial = input.balance ?? 0;
    if (initial !== 0)
      movements.push(
        WalletMovement.create({
          id: this.generateId(),
          userId: input.userId,
          walletId: wallet.id,
          direction:
            initial > 0
              ? WalletMovementDirectionEnum.CREDIT
              : WalletMovementDirectionEnum.DEBIT,
          amount: Money.create(Math.abs(initial)),
          refType: WalletMovementRefTypeEnum.ADJUST,
          refId: null,
          occurredAt,
          createdAt,
        }),
      );

    await this.repository.create(wallet, movements);

    return {
      wallet: wallet.toOutput(),
      warnings: collectBalanceWarnings({
        isNegative: wallet.balance.isNegative(),
        exceedsLimit: wallet.exceedsOverdraftLimit(),
      }),
    };
  }
}
