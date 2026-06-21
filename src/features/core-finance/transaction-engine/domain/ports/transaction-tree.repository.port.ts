import { Transaction } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import { PaymentStatusEnum } from '@/shared/kernel/enums/payment-status.enum';
import { TransactionType } from '@/shared/kernel/enums/transaction-type.enum';
import { TransactionOrigin } from '@/shared/kernel/enums/transaction-origin.enum';
import { SortCriteria } from '@/shared/query/apply-sort';
import { AtomicContext } from '@/shared/database/atomic-runner';

/**
 * Contrato único de listagem rica (R5). `userId` é obrigatório por tipo — nunca
 * vem do filtro do cliente (R4/R10). O adapter aplica só os filtros (split
 * mínimo-Firestore + resto in-memory, R6); o bloco de `sort`/`pagination` é
 * consumido pelo usecase via `shared/query` sobre o array já filtrado (R7/R8).
 */
export interface ListTransactionsQuery {
  userId: string;
  rootId?: string;
  paid?: boolean;
  type?: TransactionType;
  categoryDescriptionEnum?: string;
  paymentStatus?: PaymentStatusEnum;
  paymentMethodDescriptionEnum?: string;
  rootHasInstallments?: boolean;
  rootIsFixedCost?: boolean;
  origin?: TransactionOrigin;
  originNotIn?: TransactionOrigin[];
  refMonthDueDate?: number;
  refYearDueDate?: number;
  refMonthPaymentDate?: number;
  refYearPaymentDate?: number;
  dueDateFrom?: string;
  dueDateTo?: string;
  paymentDateFrom?: string;
  paymentDateTo?: string;
  amountMin?: number;
  amountMax?: number;
  paidAmountMin?: number;
  paidAmountMax?: number;
  sort?: SortCriteria;
  page?: number;
  size?: number;
}

export interface LeafSettlement {
  leafId: string;
  mutate: (leaf: Transaction) => void;
}

export interface TransactionTreeRepository {
  save(node: Transaction): Promise<void>;
  saveMany(nodes: Transaction[]): Promise<void>;
  /** Variantes tx-aware: gravam dentro de uma transação externa (AtomicRunner). */
  saveTx(ctx: AtomicContext, node: Transaction): Promise<void>;
  saveManyTx(ctx: AtomicContext, nodes: Transaction[]): Promise<void>;
  findActiveById(id: string, userId: string): Promise<Transaction | null>;
  findChildren(parentId: string): Promise<Transaction[]>;
  loadSubtree(nodeId: string): Promise<Transaction[]>;
  listLeaves(query: ListTransactionsQuery): Promise<Transaction[]>;
  listDeleted(rootId?: string): Promise<Transaction[]>;

  mutateAndRollup(
    targetId: string,
    mutate: (node: Transaction) => void,
    today?: Date,
  ): Promise<Transaction>;

  /** Variante tx-aware: participa de uma transação externa (AtomicRunner) em vez de abrir a própria. */
  mutateAndRollupTx(
    ctx: AtomicContext,
    targetId: string,
    mutate: (node: Transaction) => void,
    today?: Date,
  ): Promise<Transaction>;

  settleLeavesAndRollup(
    settlements: LeafSettlement[],
    today?: Date,
  ): Promise<Transaction[]>;

  /** Variante tx-aware: participa de uma transação externa (AtomicRunner) em vez de abrir a própria. */
  settleLeavesAndRollupTx(
    ctx: AtomicContext,
    settlements: LeafSettlement[],
    today?: Date,
  ): Promise<Transaction[]>;

  softDeleteSubtreeAndRollup(
    targetId: string,
    deletedAt: string,
    today?: Date,
  ): Promise<void>;
}
