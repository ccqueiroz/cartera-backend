import { Wallet } from '@/features/wallet/domain/wallet.entity';
import { WalletMovement } from '@/features/wallet/domain/wallet-movement.entity';
import { AtomicContext } from '@/shared/database/atomic-runner';

/** O que o `fn` do `mutate` devolve: a carteira e os movimentos a gravar (`null` não grava nada) e o valor que volta ao caso de uso. */
export interface WalletMutation<T> {
  save: { wallet: Wallet; movements: WalletMovement[] } | null;
  value: T;
}

export interface WalletRepository {
  findActiveById(id: string, userId: string): Promise<Wallet | null>;
  /** Lê pelo `txn.get` do ctx: a gravação concorrente faz a transação tentar de novo. */
  findActiveByIdTx(
    ctx: AtomicContext,
    id: string,
    userId: string,
  ): Promise<Wallet | null>;
  /** O `SETTLEMENT` de `createdAt` mais novo da folha, lido pelo `txn.get` do ctx; null sem ele. */
  findLatestSettlementTx(
    ctx: AtomicContext,
    refId: string,
    userId: string,
  ): Promise<WalletMovement | null>;
  /** Inclui soft-deleted (para distinguir 404 de WALLET_DELETED em edit/adjust/delete). */
  findById(id: string, userId: string): Promise<Wallet | null>;
  listActiveByUser(userId: string): Promise<Wallet[]>;
  /** Resolve a wallet default do usuário pela flag `isDefault` (não por nome — C7). */
  findDefaultByUser(userId: string): Promise<Wallet | null>;
  /** Cria a wallet e seus movimentos de abertura na mesma transação atômica (W4). */
  create(wallet: Wallet, movements: WalletMovement[]): Promise<void>;
  /** Variante tx-aware: grava saldo + movimentos numa transação externa (AtomicRunner). */
  saveWithMovementsTx(
    ctx: AtomicContext,
    wallet: Wallet,
    movements: WalletMovement[],
  ): Promise<void>;
  /**
   * Numa transação só: lê a carteira pelo `txn.get` com a regra do `findById` (a removida vem;
   * `null` sem ela), roda o `fn` e grava o que ele devolve. A gravação concorrente faz a
   * transação tentar de novo, e o erro do `fn` sai igual, sem nada gravado.
   */
  mutate<T>(
    id: string,
    userId: string,
    fn: (wallet: Wallet | null) => Promise<WalletMutation<T>>,
  ): Promise<T>;
  /** Todos os movimentos da wallet (replay do accrual + base do extrato). */
  listMovements(walletId: string, userId: string): Promise<WalletMovement[]>;
}
