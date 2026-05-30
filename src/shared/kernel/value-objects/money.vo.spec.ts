import { Money } from './money.vo';
import { ValidationError } from '../errors/domain.error';

describe('Money', () => {
  it('cria e normaliza para 2 casas', () => {
    expect(Money.create(10.999).value).toBe(11);
    expect(Money.create(10.1).value).toBe(10.1);
    expect(Money.zero().value).toBe(0);
  });

  it('rejeita negativo e não-finito', () => {
    expect(() => Money.create(-1)).toThrow(ValidationError);
    expect(() => Money.create(Number.NaN)).toThrow(ValidationError);
    expect(() => Money.create(Number.POSITIVE_INFINITY)).toThrow(
      ValidationError,
    );
  });

  it('soma e subtrai (sem negativo)', () => {
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

  it('é imutável (operações retornam nova instância)', () => {
    const a = Money.create(10);
    const b = a.add(Money.create(1));
    expect(a.value).toBe(10);
    expect(b.value).toBe(11);
  });
});
