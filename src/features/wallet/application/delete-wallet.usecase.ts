import { WalletRepository } from '@/features/wallet/domain/ports/wallet.repository.port';
import { BusinessRuleViolationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

interface DeleteWalletInput {
  userId: string;
  id: string;
  force?: boolean;
}

export class DeleteWalletUseCase {
  private constructor(
    private readonly repository: WalletRepository,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: WalletRepository,
    now: () => string,
  ): DeleteWalletUseCase {
    return new DeleteWalletUseCase(repository, now);
  }

  public async execute(input: DeleteWalletInput): Promise<void> {
    const wallet = await this.repository.findById(input.id, input.userId);
    // Idempotente: inexistente ou já removida ⇒ no-op silencioso.
    if (!wallet || !wallet.isActive) return;

    // A Cartera default é indeletável — barra antes do saldo e ignora `force` (C6).
    if (wallet.isDefault)
      throw new BusinessRuleViolationError(ErrorCode.WALLET_NOT_DELETABLE);

    if (!wallet.balance.isZero() && input.force !== true)
      throw new BusinessRuleViolationError(ErrorCode.WALLET_HAS_BALANCE);

    wallet.softDelete(this.now());
    await this.repository.update(wallet);
  }
}
