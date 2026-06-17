import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { WalletRepository } from '@/features/wallet/domain/ports/wallet.repository.port';

export const DEFAULT_WALLET_NAME = 'Cartera';

/**
 * Provisão interna (não-HTTP) da wallet default no signup (UC8/W5). Idempotente
 * por usuário: não duplica a "Cartera" se já existir.
 */
export class CreateWalletInternalUseCase {
  private constructor(
    private readonly repository: WalletRepository,
    private readonly generateId: () => string,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: WalletRepository,
    generateId: () => string,
    now: () => string,
  ): CreateWalletInternalUseCase {
    return new CreateWalletInternalUseCase(repository, generateId, now);
  }

  public async execute(input: { userId: string }): Promise<void> {
    const existing = await this.repository.findDefaultByUser(
      input.userId,
      DEFAULT_WALLET_NAME,
    );
    if (existing) return;

    const wallet = Wallet.create({
      id: this.generateId(),
      userId: input.userId,
      name: DEFAULT_WALLET_NAME,
      balance: 0,
      createdAt: this.now(),
    });
    await this.repository.create(wallet, []);
  }
}
