import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { WalletMovement } from '@/features/wallet/domain/wallet-movement.entity';
import { WalletMovementRefTypeEnum } from '@/features/wallet/domain/enums/wallet-movement.enums';
import {
  WalletMutation,
  WalletRepository,
} from '@/features/wallet/domain/ports/wallet.repository.port';
import { AtomicContext } from '@/shared/database/atomic-runner';

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

  public async findActiveByIdTx(
    _ctx: AtomicContext,
    id: string,
    userId: string,
  ): Promise<Wallet | null> {
    return this.findActiveById(id, userId);
  }

  public async findLatestSettlementTx(
    _ctx: AtomicContext,
    refId: string,
    userId: string,
  ): Promise<WalletMovement | null> {
    const newest = this.movements
      .filter((m) => m.toPersistence().userId === userId)
      .filter((m) => m.toPersistence().refId === refId)
      .filter((m) => m.refType === WalletMovementRefTypeEnum.SETTLEMENT)
      .sort((a, b) =>
        b.toPersistence().createdAt.localeCompare(a.toPersistence().createdAt),
      )[0];
    return newest ?? null;
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

  public async findDefaultByUser(userId: string): Promise<Wallet | null> {
    return (
      [...this.wallets.values()].find(
        (wallet) =>
          wallet.userId === userId && wallet.isActive && wallet.isDefault,
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

  public async saveWithMovementsTx(
    _ctx: AtomicContext,
    wallet: Wallet,
    movements: WalletMovement[],
  ): Promise<void> {
    this.wallets.set(wallet.id, wallet);
    this.movements.push(...movements);
  }

  public async mutate<T>(
    id: string,
    userId: string,
    fn: (wallet: Wallet | null) => Promise<WalletMutation<T>>,
  ): Promise<T> {
    const stored = await this.findById(id, userId);
    const { save, value } = await fn(
      stored ? Wallet.with(stored.toPersistence()) : null,
    );
    if (save) {
      this.wallets.set(save.wallet.id, save.wallet);
      this.movements.push(...save.movements);
    }
    return value;
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
