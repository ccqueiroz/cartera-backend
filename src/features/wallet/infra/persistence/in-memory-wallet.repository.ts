import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { WalletMovement } from '@/features/wallet/domain/wallet-movement.entity';
import { WalletRepository } from '@/features/wallet/domain/ports/wallet.repository.port';

/** Repositório em memória para testes de caso de uso (espelha o do transaction-engine). */
export class InMemoryWalletRepository implements WalletRepository {
  private readonly wallets = new Map<string, Wallet>();
  private readonly movements: WalletMovement[] = [];

  public async findActiveById(
    id: string,
    userId: string,
  ): Promise<Wallet | null> {
    const wallet = this.wallets.get(id);
    if (!wallet || wallet.userId !== userId || !wallet.isActive) return null;
    return wallet;
  }

  public async findById(id: string, userId: string): Promise<Wallet | null> {
    const wallet = this.wallets.get(id);
    if (!wallet || wallet.userId !== userId) return null;
    return wallet;
  }

  public async listActiveByUser(userId: string): Promise<Wallet[]> {
    return [...this.wallets.values()].filter(
      (wallet) => wallet.userId === userId && wallet.isActive,
    );
  }

  public async findDefaultByUser(
    userId: string,
    name: string,
  ): Promise<Wallet | null> {
    return (
      [...this.wallets.values()].find(
        (wallet) =>
          wallet.userId === userId &&
          wallet.isActive &&
          wallet.toOutput().name === name,
      ) ?? null
    );
  }

  public async create(
    wallet: Wallet,
    movements: WalletMovement[],
  ): Promise<void> {
    this.wallets.set(wallet.id, wallet);
    this.movements.push(...movements);
  }

  public async saveWithMovements(
    wallet: Wallet,
    movements: WalletMovement[],
  ): Promise<void> {
    this.wallets.set(wallet.id, wallet);
    this.movements.push(...movements);
  }

  public async update(wallet: Wallet): Promise<void> {
    this.wallets.set(wallet.id, wallet);
  }

  public async listMovements(
    walletId: string,
    userId: string,
  ): Promise<WalletMovement[]> {
    return this.movements
      .filter((m) => m.toPersistence().walletId === walletId)
      .filter((m) => m.toPersistence().userId === userId)
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  }
}
