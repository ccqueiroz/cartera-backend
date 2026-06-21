import { Money } from '@/shared/kernel/value-objects/money.vo';
import { Transaction } from '@/features/core-finance/transaction-engine/domain/transaction.entity';
import {
  LeafSettlement,
  TransactionTreeRepository,
} from '@/features/core-finance/transaction-engine/domain/ports/transaction-tree.repository.port';
import { PaymentMethodGateway } from '@/features/core-finance/transaction-engine/domain/ports/payment-method.gateway.port';
import { TransactionNotFoundError } from '@/features/core-finance/transaction-engine/domain/errors/transaction-not-found.error';
import {
  distributeSettlement,
  SettlementNode,
} from '@/features/core-finance/transaction-engine/domain/settlement-rateio';
import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { AtomicContext } from '@/shared/database/atomic-runner';

export interface GlobalSettlementInput {
  nodeId: string;
  userId: string;
  paymentDate: string;
  paymentMethodDescriptionEnum: string;
  /** Alvos da quitação (parcial). Ausente → todas as folhas abertas da subárvore. */
  selection?: string[];
  /** Total reportado. Ausente → quitação em cheio: cada folha pelo próprio `amount`. */
  valorPago?: number;
}

export interface SettledLeafAmount {
  leafId: string;
  paidAmount: number;
}

export interface GlobalSettlementResult {
  settledLeafIds: string[];
  /** Valor efetivamente quitado por folha — base do rastreio fino de caixa (1 movimento por folha). */
  settledAmounts: SettledLeafAmount[];
}

/**
 * Quitação global: o punho é o nó interno, o dinheiro cai nas folhas. Com
 * `valorPago` reportado, o rateio é top-down recursivo por nó (peso = `amount`,
 * Hamilton em cada nó de distribuição — T1.2.2), respeitando a granularidade da
 * seleção: selecionar folhas distribui entre elas; selecionar um nó interno
 * recursa sobre suas filhas abertas. Sem `valorPago`, quitação em cheio — cada
 * folha pelo próprio `amount` (variância 0), sem rateio. Folhas pagas ficam
 * intocadas (já contam no `currentAmount`). A aproximação permitida (T1.2.3) é só
 * no eixo desconto (proporcional vs valor-presente bancário), nunca no total nem
 * no conjunto reportado (verdade-dura T1.2.1). Ids inválidos/pagos na seleção são
 * descartados.
 */
export class GlobalSettlementUseCase {
  private constructor(
    private readonly repository: TransactionTreeRepository,
    private readonly paymentMethodGateway: PaymentMethodGateway,
    private readonly now: () => string,
  ) {}

  public static create(
    repository: TransactionTreeRepository,
    paymentMethodGateway: PaymentMethodGateway,
    now: () => string,
  ): GlobalSettlementUseCase {
    return new GlobalSettlementUseCase(repository, paymentMethodGateway, now);
  }

  public async execute(
    input: GlobalSettlementInput,
  ): Promise<GlobalSettlementResult> {
    const { settlements, amounts } = await this.prepare(input);
    if (settlements.length === 0)
      return { settledLeafIds: [], settledAmounts: [] };
    await this.repository.settleLeavesAndRollup(settlements);
    return {
      settledLeafIds: amounts.map((a) => a.leafId),
      settledAmounts: amounts,
    };
  }

  /** Variante tx-aware: quita dentro de uma transação externa (AtomicRunner). */
  public async executeTx(
    ctx: AtomicContext,
    input: GlobalSettlementInput,
  ): Promise<GlobalSettlementResult> {
    const { settlements, amounts } = await this.prepare(input);
    if (settlements.length === 0)
      return { settledLeafIds: [], settledAmounts: [] };
    await this.repository.settleLeavesAndRollupTx(ctx, settlements);
    return {
      settledLeafIds: amounts.map((a) => a.leafId),
      settledAmounts: amounts,
    };
  }

  private async prepare(input: GlobalSettlementInput): Promise<{
    settlements: LeafSettlement[];
    amounts: SettledLeafAmount[];
  }> {
    const handle = await this.repository.findActiveById(
      input.nodeId,
      input.userId,
    );
    if (!handle) throw new TransactionNotFoundError();

    const active = await this.paymentMethodGateway.isActive(
      input.paymentMethodDescriptionEnum,
    );
    if (!active)
      throw new ValidationError(ErrorCode.PAYMENT_METHOD_NOT_FOUND, {
        descriptionEnum: input.paymentMethodDescriptionEnum,
      });

    const subtree = await this.repository.loadSubtree(input.nodeId);
    const byId = new Map<string, Transaction>(
      subtree.map((node) => [node.id, node]),
    );
    const openChildrenOf = (id: string): SettlementNode[] =>
      subtree
        .filter((node) => node.parentId === id && !node.paid && !node.isDeleted)
        .map(toSettlementNode);

    const targets = this.resolveTargets(input, byId, openChildrenOf);
    if (targets.length === 0) return { settlements: [], amounts: [] };

    const paidAmountByLeaf =
      input.valorPago === undefined
        ? this.payInFull(targets, openChildrenOf)
        : distributeSettlement(input.valorPago, targets, openChildrenOf);

    const updatedAt = this.now();
    const settlements: LeafSettlement[] = [];
    const amounts: SettledLeafAmount[] = [];
    for (const [leafId, paidAmount] of paidAmountByLeaf) {
      settlements.push({
        leafId,
        mutate: (node: Transaction) =>
          node.settle({
            paymentDate: input.paymentDate,
            paidAmount,
            paymentMethodDescriptionEnum: input.paymentMethodDescriptionEnum,
            updatedAt,
          }),
      });
      amounts.push({ leafId, paidAmount: paidAmount.value });
    }
    return { settlements, amounts };
  }

  private resolveTargets(
    input: GlobalSettlementInput,
    byId: Map<string, Transaction>,
    openChildrenOf: (id: string) => SettlementNode[],
  ): SettlementNode[] {
    if (!input.selection) return openChildrenOf(input.nodeId);

    const selectedIds = new Set(input.selection);
    const hasSelectedAncestor = (node: Transaction): boolean => {
      let parentId = node.parentId;
      while (parentId) {
        if (selectedIds.has(parentId)) return true;
        parentId = byId.get(parentId)?.parentId ?? null;
      }
      return false;
    };

    // Mantém só o topo de cada ramo selecionado: um descendente cujo ancestral
    // também foi selecionado já é coberto pela recursão do ancestral. Sem o guard,
    // ele entraria no rateio duas vezes e Σ folhas ≠ X.
    return [...selectedIds]
      .map((id) => byId.get(id))
      .filter(
        (node): node is Transaction =>
          node !== undefined &&
          !node.paid &&
          !node.isDeleted &&
          !hasSelectedAncestor(node),
      )
      .map(toSettlementNode);
  }

  /** Quitação em cheio: cada folha aberta sob os alvos pelo próprio `amount`. */
  private payInFull(
    targets: SettlementNode[],
    openChildrenOf: (id: string) => SettlementNode[],
  ): Map<string, Money> {
    const result = new Map<string, Money>();
    const collect = (node: SettlementNode): void => {
      if (node.isLeaf) result.set(node.id, Money.create(node.amount));
      else openChildrenOf(node.id).forEach(collect);
    };
    targets.forEach(collect);
    return result;
  }
}

function toSettlementNode(node: Transaction): SettlementNode {
  return {
    id: node.id,
    amount: node.amount.value,
    isLeaf: !node.hasChildren,
  };
}
