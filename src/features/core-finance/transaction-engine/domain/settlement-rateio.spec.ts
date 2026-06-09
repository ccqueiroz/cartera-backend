import { distributeSettlement, SettlementNode } from './settlement-rateio';

const leaf = (id: string, amount: number): SettlementNode => ({
  id,
  amount,
  isLeaf: true,
});
const internal = (id: string, amount: number): SettlementNode => ({
  id,
  amount,
  isLeaf: false,
});

function sum(result: Map<string, { value: number }>): number {
  return Number(
    [...result.values()].reduce((acc, m) => acc + m.value, 0).toFixed(2),
  );
}

describe('distributeSettlement (rateio top-down T1.2.2)', () => {
  // Árvore assimétrica profundidade 3 COM juros: A (interno, amount 400) cujas
  // folhas somam 375 (a1 150 + a2 225); B folha 200.
  const openChildrenOf = (id: string): SettlementNode[] =>
    id === 'A' ? [leaf('a1', 150), leaf('a2', 225)] : [];

  it('alvo interno recursa por nó: X=600 → a1=160, a2=240, B=200', () => {
    const result = distributeSettlement(
      600,
      [internal('A', 400), leaf('B', 200)],
      openChildrenOf,
    );
    expect(result.get('a1')?.value).toBe(160);
    expect(result.get('a2')?.value).toBe(240);
    expect(result.get('B')?.value).toBe(200);
    expect(sum(result)).toBe(600);
  });

  it('seleção em folhas é flat sobre elas (granularidade importa): X=600', () => {
    const result = distributeSettlement(
      600,
      [leaf('a1', 150), leaf('a2', 225), leaf('B', 200)],
      openChildrenOf,
    );
    expect(result.get('a1')?.value).toBe(156.52);
    expect(result.get('a2')?.value).toBe(234.78);
    expect(result.get('B')?.value).toBe(208.7);
    expect(sum(result)).toBe(600);
  });

  it('nível único 11×200, X=1300: conserva o total (cenário do spec)', () => {
    const targets = Array.from({ length: 11 }, (_, i) => leaf(`p${i}`, 200));
    const result = distributeSettlement(1300, targets, () => []);
    expect(result.size).toBe(11);
    expect(sum(result)).toBe(1300);
  });

  it('folha paga fica fora de openChildrenOf → intocada, fatia inteira p/ a aberta', () => {
    const onlyOneOpen = (id: string): SettlementNode[] =>
      id === 'A' ? [leaf('a1', 150)] : [];
    const result = distributeSettlement(300, [internal('A', 400)], onlyOneOpen);
    expect(result.get('a1')?.value).toBe(300);
    expect(result.has('a2')).toBe(false);
    expect(sum(result)).toBe(300);
  });

  it('alvos vazios → mapa vazio', () => {
    expect(distributeSettlement(100, [], () => []).size).toBe(0);
  });
});
