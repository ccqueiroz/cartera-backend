import { DateRange } from './date-range.vo';
import { ValidationError } from '../errors/domain.error';

describe('DateRange', () => {
  const start = new Date('2026-01-01');
  const end = new Date('2026-01-31');

  it('cria intervalo válido', () => {
    const range = DateRange.create(start, end);
    expect(range.initialDate.getTime()).toBe(start.getTime());
    expect(range.finalDate.getTime()).toBe(end.getTime());
  });

  it('aceita intervalo de 1 dia (igual)', () => {
    expect(() => DateRange.create(start, start)).not.toThrow();
  });

  it('rejeita inicial > final', () => {
    expect(() => DateRange.create(end, start)).toThrow(ValidationError);
  });

  it('contains respeita os limites (inclusivo)', () => {
    const range = DateRange.create(start, end);
    expect(range.contains(new Date('2026-01-15'))).toBe(true);
    expect(range.contains(start)).toBe(true);
    expect(range.contains(end)).toBe(true);
    expect(range.contains(new Date('2026-02-01'))).toBe(false);
  });

  it('não vaza referência mutável das datas', () => {
    const range = DateRange.create(start, end);
    const before = range.initialDate.getTime();
    range.initialDate.setFullYear(1999);
    expect(range.initialDate.getTime()).toBe(before);
  });
});
