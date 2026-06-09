import { Transaction } from '@/features/core-finance/transaction-engine/domain/transaction.entity';

export interface LeafFilter {
  rootId?: string;
  paid?: boolean;
  refMonthDueDate?: number;
  refYearDueDate?: number;
  refMonthPaymentDate?: number;
  refYearPaymentDate?: number;
}

export interface LeafSettlement {
  leafId: string;
  mutate: (leaf: Transaction) => void;
}

export interface TransactionTreeRepository {
  save(node: Transaction): Promise<void>;
  saveMany(nodes: Transaction[]): Promise<void>;
  findActiveById(id: string): Promise<Transaction | null>;
  findChildren(parentId: string): Promise<Transaction[]>;
  loadSubtree(nodeId: string): Promise<Transaction[]>;
  listLeaves(filter: LeafFilter): Promise<Transaction[]>;
  listDeleted(rootId?: string): Promise<Transaction[]>;

  mutateAndRollup(
    targetId: string,
    mutate: (node: Transaction) => void,
    today?: Date,
  ): Promise<Transaction>;

  settleLeavesAndRollup(
    settlements: LeafSettlement[],
    today?: Date,
  ): Promise<Transaction[]>;

  softDeleteSubtreeAndRollup(
    targetId: string,
    deletedAt: string,
    today?: Date,
  ): Promise<void>;
}
