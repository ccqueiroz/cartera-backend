import {
  Firestore,
  Transaction as FirestoreTransaction,
} from 'firebase-admin/firestore';

/**
 * Contexto opaco de uma transação multi-agregado. O coordenador (use case) só o
 * repassa adiante — quem o desembrulha são os repositórios participantes (infra),
 * via suas variantes tx-aware. Mantém o SDK do Firestore fora da camada de
 * aplicação.
 */
export interface AtomicContext {
  readonly txn: FirestoreTransaction;
}

/**
 * Abre uma única `runTransaction` do Firestore e entrega o `ctx` opaco ao
 * trabalho. Tudo que escrever pelo `ctx` comita junto (tudo-ou-nada); o
 * Firestore exige todas as leituras antes das escritas — os participantes já
 * respeitam isso. Peça compartilhada por todos os condutores multi-agregado
 * (bills, card-invoice, transfer-between-wallets).
 */
export class AtomicRunner {
  private constructor(private readonly db: Firestore) {}

  public static create(db: Firestore): AtomicRunner {
    return new AtomicRunner(db);
  }

  public async run<T>(work: (ctx: AtomicContext) => Promise<T>): Promise<T> {
    return this.db.runTransaction((txn) => work({ txn }));
  }
}
