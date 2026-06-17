import { SignedMoney } from './signed-money.vo';
import { Money } from './money.vo';
import { ValidationError } from '../errors/domain.error';
import { ErrorCode } from '../errors/error-code';

function captureError(fn: () => unknown): unknown {
  try {
    fn();
    return undefined;
  } catch (error) {
    return error;
  }
}

describe('SignedMoney', () => {
  it('aceita valor negativo e normaliza para 2 casas', () => {
    expect(SignedMoney.create(-100.5).value).toBe(-100.5);
    expect(SignedMoney.create(-1.005).value).toBe(-1);
    expect(SignedMoney.zero().value).toBe(0);
  });

  it('rejeita não-finito com MONEY_INVALID_NUMBER', () => {
    expect(() => SignedMoney.create(Number.POSITIVE_INFINITY)).toThrow(
      ValidationError,
    );
    const thrown = captureError(() => SignedMoney.create(Number.NaN));
    expect(thrown).toBeInstanceOf(ValidationError);
    expect((thrown as ValidationError).code).toBe(
      ErrorCode.MONEY_INVALID_NUMBER,
    );
  });

  it('subtract NÃO clampa (ao contrário de Money)', () => {
    expect(SignedMoney.create(50).subtract(SignedMoney.create(80)).value).toBe(
      -30,
    );
    expect(SignedMoney.create(0).subtract(SignedMoney.create(100)).value).toBe(
      -100,
    );
  });

  it('soma preservando sinal', () => {
    expect(SignedMoney.create(-30).add(SignedMoney.create(100)).value).toBe(70);
    expect(SignedMoney.create(-30).add(SignedMoney.create(10)).value).toBe(-20);
  });

  it('isNegative discrimina a posição', () => {
    expect(SignedMoney.create(-0.01).isNegative()).toBe(true);
    expect(SignedMoney.create(0).isNegative()).toBe(false);
    expect(SignedMoney.create(0.01).isNegative()).toBe(false);
  });

  it('é imutável (operações retornam nova instância)', () => {
    const a = SignedMoney.create(10);
    const b = a.subtract(SignedMoney.create(30));
    expect(a.value).toBe(10);
    expect(b.value).toBe(-20);
    expect(a).not.toBe(b);
  });

  it('compara e formata', () => {
    expect(SignedMoney.create(-5).equals(SignedMoney.create(-5))).toBe(true);
    expect(SignedMoney.create(0).isGreaterThan(SignedMoney.create(-1))).toBe(
      true,
    );
    expect(SignedMoney.create(-1234.5).format()).toContain('1.234,50');
  });

  it('Money permanece com invariante ≥ 0 (regressão)', () => {
    expect(() => Money.create(-1)).toThrow(ValidationError);
    expect(Money.create(3).subtract(Money.create(10)).value).toBe(0);
  });
});
