import { Money } from './money.vo';
import { ValidationError } from '../errors/domain.error';

describe('Money', () => {
  it('creates and normalizes to 2 decimal places', () => {
    expect(Money.create(10.999).value).toBe(11);
    expect(Money.create(10.1).value).toBe(10.1);
    expect(Money.zero().value).toBe(0);
  });

  it('rejects negative and non-finite values', () => {
    expect(() => Money.create(-1)).toThrow(ValidationError);
    expect(() => Money.create(Number.NaN)).toThrow(ValidationError);
    expect(() => Money.create(Number.POSITIVE_INFINITY)).toThrow(
      ValidationError,
    );
  });

  it('adds and subtracts (no negative result)', () => {
    expect(Money.create(10).add(Money.create(5.55)).value).toBe(15.55);
    expect(Money.create(10).subtract(Money.create(3)).value).toBe(7);
    expect(Money.create(3).subtract(Money.create(10)).value).toBe(0);
  });

  it('multiplica e arredonda', () => {
    expect(Money.create(10).multiply(3).value).toBe(30);
    expect(Money.create(10).multiply(1 / 3).value).toBe(3.33);
  });

  it('compara e formata', () => {
    expect(Money.create(5).equals(Money.create(5))).toBe(true);
    expect(Money.create(5).isGreaterThan(Money.create(4))).toBe(true);
    expect(Money.zero().isZero()).toBe(true);
    expect(Money.create(1234.5).format()).toContain('1.234,50');
  });

  it('is immutable (operations return a new instance)', () => {
    const a = Money.create(10);
    const b = a.add(Money.create(1));
    expect(a.value).toBe(10);
    expect(b.value).toBe(11);
  });

  describe('allocate (Hamilton/largest-remainder)', () => {
    const sum = (slices: Money[]): number =>
      Number(slices.reduce((acc, s) => acc + s.value, 0).toFixed(2));

    it('11 equal weights over 1300: sum = 1300, extra cent goes to the largest remainders', () => {
      const slices = Money.create(1300).allocate(Array(11).fill(200));
      expect(slices).toHaveLength(11);
      expect(sum(slices)).toBe(1300);
      expect(slices.filter((s) => s.value === 118.19)).toHaveLength(2);
      expect(slices.filter((s) => s.value === 118.18)).toHaveLength(9);
    });

    it('100 em 3 partes iguais: 33.34, 33.33, 33.33 (resto p/ a primeira)', () => {
      const slices = Money.create(100).allocate([1, 1, 1]);
      expect(slices.map((s) => s.value)).toEqual([33.34, 33.33, 33.33]);
      expect(sum(slices)).toBe(100);
    });

    it('a single ratio gets the whole value', () => {
      const slices = Money.create(118.18).allocate([150]);
      expect(slices).toHaveLength(1);
      expect(slices[0].value).toBe(118.18);
    });

    it('peso zero entre pesos positivos: fatia zerada, total conservado', () => {
      const slices = Money.create(100).allocate([1, 0, 1]);
      expect(slices[1].value).toBe(0);
      expect(sum(slices)).toBe(100);
    });

    it('ratios vazio devolve lista vazia', () => {
      expect(Money.create(100).allocate([])).toEqual([]);
    });

    it('todos os pesos nulos: total na primeira fatia, resto zerado', () => {
      const slices = Money.create(100).allocate([0, 0, 0]);
      expect(slices.map((s) => s.value)).toEqual([100, 0, 0]);
      expect(sum(slices)).toBe(100);
    });

    it('pesos distintos: rateio proporcional conserva o total', () => {
      const slices = Money.create(100).allocate([1, 2, 1]);
      expect(sum(slices)).toBe(100);
      expect(slices[1].value).toBeGreaterThan(slices[0].value);
    });

    it('is pure: does not mutate the original instance', () => {
      const original = Money.create(1300);
      original.allocate(Array(11).fill(200));
      expect(original.value).toBe(1300);
    });

    it('property: sum of slices = input for varied values and weights', () => {
      const cases: Array<[number, number[]]> = [
        [1300, Array(11).fill(200)],
        [100, [1, 1, 1]],
        [0.05, [1, 1, 1]],
        [999.99, [7, 3, 11, 5]],
        [50, [0, 1, 0, 1]],
      ];
      for (const [value, ratios] of cases) {
        expect(sum(Money.create(value).allocate(ratios))).toBe(value);
      }
    });
  });
});
