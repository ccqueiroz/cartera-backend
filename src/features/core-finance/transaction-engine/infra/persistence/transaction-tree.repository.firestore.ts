import {
  CollectionReference,
  Firestore,
  Query,
  Transaction as FirestoreTransaction,
} from 'firebase-admin/firestore';
import {
  Transaction,
  TransactionPersistence,
} from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import {
  LeafFilter,
  LeafSettlement,
  TransactionTreeRepository,
} from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';
import { TransactionNotFoundError } from '@/features/core-finance/transaction-engine/domain/errors/transaction-not-found.error';

/**
 * Árvore achatada na coleção `Transaction` (ADR-04). Escrita atômica
 * caminho-até-raiz via `runTransaction` (ADR-05): todas as leituras antes de
 * qualquer escrita, para que rollups intermediários nunca sejam lidos pela
 * metade. Leitura lazy nível-a-nível por `parentId`. Toda query padrão filtra
 * `deleted`.
 */
export class TransactionTreeRepositoryFirestore
  implements TransactionTreeRepository
{
  private static readonly COLLECTION = 'Transaction';

  private constructor(private readonly db: Firestore) {}

  public static create(db: Firestore): TransactionTreeRepositoryFirestore {
    return new TransactionTreeRepositoryFirestore(db);
  }

  public async save(node: Transaction): Promise<void> {
    await this.collection().doc(node.id).set(node.toPersistence());
  }

  public async saveMany(nodes: Transaction[]): Promise<void> {
    const batch = this.db.batch();
    for (const node of nodes)
      batch.set(this.collection().doc(node.id), node.toPersistence());
    await batch.commit();
  }

  public async findActiveById(id: string): Promise<Transaction | null> {
    const doc = await this.collection().doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as TransactionPersistence;
    return data.deleted ? null : Transaction.with(data);
  }

  public async findChildren(parentId: string): Promise<Transaction[]> {
    const query = await this.collection()
      .where('parentId', '==', parentId)
      .where('deleted', '==', false)
      .get();
    return query.docs.map((doc) =>
      Transaction.with(doc.data() as TransactionPersistence),
    );
  }

  public async loadSubtree(nodeId: string): Promise<Transaction[]> {
    const root = await this.findActiveById(nodeId);
    if (!root) return [];
    const collected = [root];
    const stack = [nodeId];
    while (stack.length > 0) {
      const parentId = stack.pop() as string;
      const children = await this.findChildren(parentId);
      for (const child of children) {
        collected.push(child);
        stack.push(child.id);
      }
    }
    return collected;
  }

  public async listLeaves(filter: LeafFilter): Promise<Transaction[]> {
    let query: Query = this.collection()
      .where('hasChildren', '==', false)
      .where('deleted', '==', false);

    if (filter.rootId !== undefined)
      query = query.where('rootId', '==', filter.rootId);
    if (filter.paid !== undefined)
      query = query.where('paid', '==', filter.paid);
    if (filter.refMonthDueDate !== undefined)
      query = query.where('refMonthDueDate', '==', filter.refMonthDueDate);
    if (filter.refYearDueDate !== undefined)
      query = query.where('refYearDueDate', '==', filter.refYearDueDate);
    if (filter.refMonthPaymentDate !== undefined)
      query = query.where(
        'refMonthPaymentDate',
        '==',
        filter.refMonthPaymentDate,
      );
    if (filter.refYearPaymentDate !== undefined)
      query = query.where(
        'refYearPaymentDate',
        '==',
        filter.refYearPaymentDate,
      );

    const snap = await query.get();
    return snap.docs.map((doc) =>
      Transaction.with(doc.data() as TransactionPersistence),
    );
  }

  public async listDeleted(rootId?: string): Promise<Transaction[]> {
    let query: Query = this.collection().where('deleted', '==', true);
    if (rootId !== undefined) query = query.where('rootId', '==', rootId);
    const snap = await query.get();
    return snap.docs.map((doc) =>
      Transaction.with(doc.data() as TransactionPersistence),
    );
  }

  public async mutateAndRollup(
    targetId: string,
    mutate: (node: Transaction) => void,
    today?: Date,
  ): Promise<Transaction> {
    return this.db.runTransaction(async (txn) => {
      const target = await this.readActive(txn, targetId);
      if (!target) throw new TransactionNotFoundError();

      mutate(target);
      const updated = new Map<string, Transaction>([[target.id, target]]);
      const writeOrder: Transaction[] = [target];

      let cursor: Transaction | undefined = target;
      let root = target;
      while (cursor) {
        if (cursor.hasChildren) {
          const children = await this.readChildren(txn, cursor.id, updated);
          cursor.recomputeFromChildren(children, today);
        }
        root = cursor;
        if (!cursor.parentId) break;
        const parent = await this.readActive(txn, cursor.parentId);
        if (!parent) break;
        updated.set(parent.id, parent);
        writeOrder.push(parent);
        cursor = parent;
      }

      for (const node of writeOrder)
        txn.set(this.collection().doc(node.id), node.toPersistence());
      return root;
    });
  }

  public async settleLeavesAndRollup(
    settlements: LeafSettlement[],
    today?: Date,
  ): Promise<Transaction[]> {
    return this.db.runTransaction(async (txn) => {
      const updated = new Map<string, Transaction>();
      const settled: Transaction[] = [];
      for (const settlement of settlements) {
        const leaf = await this.readActive(txn, settlement.leafId);
        if (!leaf) continue;
        settlement.mutate(leaf);
        updated.set(leaf.id, leaf);
        settled.push(leaf);
      }

      const ancestors = await this.collectAncestors(
        txn,
        settled.map((leaf) => leaf.id),
        updated,
      );
      const ordered = [...ancestors.values()].sort((a, b) => b.depth - a.depth);
      for (const { node } of ordered) {
        const children = await this.readChildren(txn, node.id, updated);
        node.recomputeFromChildren(children, today);
      }

      for (const node of updated.values())
        txn.set(this.collection().doc(node.id), node.toPersistence());
      return settled;
    });
  }

  public async softDeleteSubtreeAndRollup(
    targetId: string,
    deletedAt: string,
    today?: Date,
  ): Promise<void> {
    await this.db.runTransaction(async (txn) => {
      const target = await this.readActive(txn, targetId);
      if (!target) throw new TransactionNotFoundError();

      const updated = new Map<string, Transaction>();
      const stack = [targetId];
      while (stack.length > 0) {
        const parentId = stack.pop() as string;
        const owner =
          updated.get(parentId) ?? (await this.readActive(txn, parentId));
        if (owner) {
          owner.softDelete(deletedAt);
          updated.set(owner.id, owner);
        }
        const children = await this.readChildren(txn, parentId, updated);
        for (const child of children) {
          child.softDelete(deletedAt);
          updated.set(child.id, child);
          stack.push(child.id);
        }
      }

      let cursor = target.parentId
        ? await this.readActive(txn, target.parentId)
        : undefined;
      while (cursor) {
        const children = await this.readChildren(txn, cursor.id, updated);
        cursor.recomputeFromChildren(children, today);
        updated.set(cursor.id, cursor);
        cursor = cursor.parentId
          ? await this.readActive(txn, cursor.parentId)
          : undefined;
      }

      for (const node of updated.values())
        txn.set(this.collection().doc(node.id), node.toPersistence());
    });
  }

  private async readActive(
    txn: FirestoreTransaction,
    id: string,
  ): Promise<Transaction | null> {
    const doc = await txn.get(this.collection().doc(id));
    if (!doc.exists) return null;
    const data = doc.data() as TransactionPersistence;
    return data.deleted ? null : Transaction.with(data);
  }

  private async readChildren(
    txn: FirestoreTransaction,
    parentId: string,
    updated: Map<string, Transaction>,
  ): Promise<Transaction[]> {
    const snap = await txn.get(
      this.collection()
        .where('parentId', '==', parentId)
        .where('deleted', '==', false),
    );
    return snap.docs.map((doc) => {
      const id = doc.id;
      return (
        updated.get(id) ??
        Transaction.with(doc.data() as TransactionPersistence)
      );
    });
  }

  private async collectAncestors(
    txn: FirestoreTransaction,
    leafIds: string[],
    updated: Map<string, Transaction>,
  ): Promise<Map<string, { node: Transaction; depth: number }>> {
    const ancestors = new Map<string, { node: Transaction; depth: number }>();
    for (const leafId of leafIds) {
      const chain: string[] = [];
      let current = updated.get(leafId) ?? (await this.readActive(txn, leafId));
      current = current?.parentId
        ? updated.get(current.parentId) ??
          (await this.readActive(txn, current.parentId))
        : null;
      while (current) {
        chain.push(current.id);
        if (!ancestors.has(current.id)) updated.set(current.id, current);
        const parentId: string | null = current.parentId;
        current = parentId
          ? updated.get(parentId) ?? (await this.readActive(txn, parentId))
          : null;
      }
      chain.forEach((id, index) => {
        const node = updated.get(id) as Transaction;
        ancestors.set(id, { node, depth: chain.length - index });
      });
    }
    return ancestors;
  }

  private collection(): CollectionReference {
    return this.db.collection(TransactionTreeRepositoryFirestore.COLLECTION);
  }
}
