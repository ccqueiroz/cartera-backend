import { addMonths, monthDelta } from './installment-date.util';

describe('installment-date util', () => {
  it('addMonths soma e subtrai meses fixando o dia', () => {
    expect(addMonths('2026-03-10', 3)).toBe('2026-06-10');
    expect(addMonths('2026-09-10', -5)).toBe('2026-04-10');
  });

  it('addMonths cruza a virada de ano', () => {
    expect(addMonths('2026-11-15', 3)).toBe('2027-02-15');
  });

  it('monthDelta conta a diferença em meses com sinal', () => {
    expect(monthDelta('2026-03-10', '2026-06-10')).toBe(3);
    expect(monthDelta('2026-09-10', '2026-04-10')).toBe(-5);
    expect(monthDelta('2026-12-01', '2027-02-01')).toBe(2);
  });
});
