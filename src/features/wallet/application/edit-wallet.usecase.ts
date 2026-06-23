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
    const wallet = await this.loadOwned(input.id, input.userId);
    wallet.edit({
      name: input.name,
      hasOverdraft: input.hasOverdraft,
      overdraftLimit: input.overdraftLimit,
      overdraftMonthlyRate: input.overdraftMonthlyRate,
      overdraftGraceDays: input.overdraftGraceDays,
      updatedAt: this.now(),
    });
    await this.repository.update(wallet);
    return wallet.toOutput();
  }

  private async loadOwned(id: string, userId: string): Promise<Wallet> {
    const wallet = await this.repository.findById(id, userId);
    if (!wallet) throw new EntityNotFoundError(ErrorCode.WALLET_NOT_FOUND);
    if (!wallet.isActive)
      throw new DuplicateEntityError(ErrorCode.WALLET_DELETED);
    return wallet;
  }
}
