import { Transaction } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import {
  LeafFilter,
  LeafSettlement,
  TransactionTreeRepository,
} from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';
import { TransactionNotFoundError } from '@/features/core-finance/transaction-engine/domain/errors/transaction-not-found.error';

/**
 * Adapter em memória do repositório de árvore. Implementação de referência da
 * porta (ADR-04/05): guarda instâncias vivas, então o rollup caminho-até-raiz é
 * direto (as filhas lidas já são as instâncias mutadas). Usado por testes e como
 * contrato executável; o adapter Firestore espelha este comportamento sob
 * `runTransaction`.
 */
export class InMemoryTransactionTreeRepository
  implements TransactionTreeRepository
{
  private readonly store = new Map<string, Transaction>();

  public async save(node: Transaction): Promise<void> {
    this.store.set(node.id, node);
  }

  public async saveMany(nodes: Transaction[]): Promise<void> {
    for (const node of nodes) this.store.set(node.id, node);
  }

  public async findActiveById(id: string): Promise<Transaction | null> {
    const node = this.store.get(id);
    return !node || node.isDeleted ? null : node;
  }

  public async findChildren(parentId: string): Promise<Transaction[]> {
    return [...this.store.values()].filter(
      (node) => node.parentId === parentId && !node.isDeleted,
    );
  }

  public async loadSubtree(nodeId: string): Promise<Transaction[]> {
    const root = this.store.get(nodeId);
    if (!root || root.isDeleted) return [];
    const collected = [root];
    const stack = [nodeId];
    while (stack.length > 0) {
      const parentId = stack.pop() as string;
      for (const node of this.store.values()) {
        if (node.parentId === parentId && !node.isDeleted) {
          collected.push(node);
          stack.push(node.id);
        }
      }
    }
    return collected;
  }

  public async listLeaves(filter: LeafFilter): Promise<Transaction[]> {
    return [...this.store.values()].filter((node) => {
      if (node.hasChildren || node.isDeleted) return false;
      if (filter.rootId !== undefined && node.rootId !== filter.rootId)
        return false;
      if (filter.paid !== undefined && node.paid !== filter.paid) return false;
      const view = node.toOutput();
      if (
        filter.refMonthDueDate !== undefined &&
        view.refMonthDueDate !== filter.refMonthDueDate
      )
        return false;
      if (
        filter.refYearDueDate !== undefined &&
        view.refYearDueDate !== filter.refYearDueDate
      )
        return false;
      if (
        filter.refMonthPaymentDate !== undefined &&
        view.refMonthPaymentDate !== filter.refMonthPaymentDate
      )
        return false;
      if (
        filter.refYearPaymentDate !== undefined &&
        view.refYearPaymentDate !== filter.refYearPaymentDate
      )
        return false;
      return true;
    });
  }

  public async listDeleted(rootId?: string): Promise<Transaction[]> {
    return [...this.store.values()].filter(
      (node) =>
        node.isDeleted && (rootId === undefined || node.rootId === rootId),
    );
  }

  public async mutateAndRollup(
    targetId: string,
    mutate: (node: Transaction) => void,
    today?: Date,
  ): Promise<Transaction> {
    const target = this.store.get(targetId);
    if (!target || target.isDeleted) throw new TransactionNotFoundError();

    mutate(target);

    let cursor: Transaction | undefined = target;
    let root = target;
    while (cursor) {
      if (cursor.hasChildren)
        cursor.recomputeFromChildren(await this.findChildren(cursor.id), today);
      root = cursor;
      cursor = cursor.parentId ? this.store.get(cursor.parentId) : undefined;
    }
    return root;
  }

  public async settleLeavesAndRollup(
    settlements: LeafSettlement[],
    today?: Date,
  ): Promise<Transaction[]> {
    const settled: Transaction[] = [];
    for (const settlement of settlements) {
      const leaf = this.store.get(settlement.leafId);
      if (!leaf || leaf.isDeleted) continue;
      settlement.mutate(leaf);
      settled.push(leaf);
    }
    await this.rollupAncestorsOf(
      settled.map((leaf) => leaf.id),
      today,
    );
    return settled;
  }

  public async softDeleteSubtreeAndRollup(
    targetId: string,
    deletedAt: string,
    today?: Date,
  ): Promise<void> {
    const subtree = await this.loadSubtree(targetId);
    if (subtree.length === 0) throw new TransactionNotFoundError();
    for (const node of subtree) node.softDelete(deletedAt);

    const target = this.store.get(targetId) as Transaction;
    if (target.parentId) await this.rollupPathToRoot(target.parentId, today);
  }

  private async rollupPathToRoot(fromId: string, today?: Date): Promise<void> {
    let cursor: Transaction | undefined = this.store.get(fromId);
    while (cursor) {
      if (cursor.hasChildren)
        cursor.recomputeFromChildren(await this.findChildren(cursor.id), today);
      cursor = cursor.parentId ? this.store.get(cursor.parentId) : undefined;
    }
  }

  private async rollupAncestorsOf(
    leafIds: string[],
    today?: Date,
  ): Promise<void> {
    const ancestorIds = new Set<string>();
    for (const leafId of leafIds) {
      let node = this.store.get(leafId);
      node = node?.parentId ? this.store.get(node.parentId) : undefined;
      while (node) {
        ancestorIds.add(node.id);
        node = node.parentId ? this.store.get(node.parentId) : undefined;
      }
    }
    const ordered = [...ancestorIds].sort(
      (a, b) => this.depthOf(b) - this.depthOf(a),
    );
    for (const id of ordered) {
      const node = this.store.get(id) as Transaction;
      if (node.hasChildren)
        node.recomputeFromChildren(await this.findChildren(id), today);
    }
  }

  private depthOf(id: string): number {
    let depth = 0;
    let cursor = this.store.get(id);
    while (cursor?.parentId) {
      depth += 1;
      cursor = this.store.get(cursor.parentId);
    }
    return depth;
  }
}
