import { Money } from '@/shared/kernel/value-objects/money.vo';

export interface SettlementNode {
  id: string;
  amount: number;
  isLeaf: boolean;
}

/**
 * Rateio top-down (T1.2.2): distribui `value` entre `targets` por peso = amount
 * (Hamilton via `Money.allocate`); cada alvo interno repassa a fatia inteira
 * recursando sobre suas filhas abertas (`openChildrenOf`). Conservação: cada
 * `allocate` soma exato ao que entrou → Σ folhas = `value`. Devolve folhaId → fatia.
 *
 * Um nó interno ABERTO tem ≥ 1 filha aberta (aberto ⟺ nem todas as filhas pagas),
 * então a recursão sempre alcança folhas e nenhuma fatia se perde.
 */
export function distributeSettlement(
  value: number,
  targets: SettlementNode[],
  openChildrenOf: (id: string) => SettlementNode[],
): Map<string, Money> {
  const result = new Map<string, Money>();
  const recurse = (received: number, nodes: SettlementNode[]): void => {
    if (nodes.length === 0) return;
    const slices = Money.create(received).allocate(nodes.map((n) => n.amount));
    nodes.forEach((node, index) => {
      if (node.isLeaf) result.set(node.id, slices[index]);
      else recurse(slices[index].value, openChildrenOf(node.id));
    });
  };
  recurse(value, targets);
  return result;
}
