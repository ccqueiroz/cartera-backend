import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { WalletMovement } from '@/features/wallet/domain/wallet-movement.entity';

export interface WalletRepository {
  findActiveById(id: string, userId: string): Promise<Wallet | null>;
  /** Inclui soft-deleted (para distinguir 404 de WALLET_DELETED em edit/adjust/delete). */
  findById(id: string, userId: string): Promise<Wallet | null>;
  listActiveByUser(userId: string): Promise<Wallet[]>;
  findDefaultByUser(userId: string, name: string): Promise<Wallet | null>;
  /** Cria a wallet e seus movimentos de abertura na mesma transação atômica (W4). */
  create(wallet: Wallet, movements: WalletMovement[]): Promise<void>;
  /** Atualiza saldo da wallet e anexa movimentos na mesma transação atômica (W4). */
  saveWithMovements(wallet: Wallet, movements: WalletMovement[]): Promise<void>;
  /** Atualiza só a wallet (edit/soft-delete) — sem movimento. */
  update(wallet: Wallet): Promise<void>;
  /** Todos os movimentos da wallet (replay do accrual + base do extrato). */
  listMovements(walletId: string, userId: string): Promise<WalletMovement[]>;
}
