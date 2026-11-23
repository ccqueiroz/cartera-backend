import { Wallet, WalletOutput } from '@/features/wallet/domain/wallet.entity';
import { WalletRepository } from '@/features/wallet/domain/ports/wallet.repository.port';
import {
  DuplicateEntityError,
  EntityNotFoundError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

interface EditWalletInput {
  userId: string;
  id: string;
  name?: string;
  hasOverdraft?: boolean;
  overdraftLimit?: number;
  overdraftMonthlyRate?: number;
  overdraftGraceDays?: number;
}

export class EditWalletUseCase {
  private constructor(
    private readonly repository: WalletRepository,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: WalletRepository,
    now: () => string,
  ): EditWalletUseCase {
    return new EditWalletUseCase(repository, now);
  }

  public async execute(input: EditWalletInput): Promise<WalletOutput> {
    return this.repository.mutate(input.id, input.userId, async (loaded) => {
      const wallet = this.assertOwned(loaded);
      wallet.edit({
        name: input.name,
        hasOverdraft: input.hasOverdraft,
        overdraftLimit: input.overdraftLimit,
        overdraftMonthlyRate: input.overdraftMonthlyRate,
        overdraftGraceDays: input.overdraftGraceDays,
        updatedAt: this.now(),
      });
      return {
        save: { wallet, movements: [] },
        value: wallet.toOutput(),
      };
    });
  }

  private assertOwned(wallet: Wallet | null): Wallet {
    if (!wallet) throw new EntityNotFoundError(ErrorCode.WALLET_NOT_FOUND);
    if (!wallet.isActive)
      throw new DuplicateEntityError(ErrorCode.WALLET_DELETED);
    return wallet;
  }
}
