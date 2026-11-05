import { DateRange } from './date-range.vo';
import { ValidationError } from '@/shared/kernel/errors/domain.error';

describe('DateRange', () => {
  const start = new Date('2026-01-01');
  const end = new Date('2026-01-31');

  it('creates a valid range', () => {
    const range = DateRange.create(start, end);
    expect(range.initialDate.getTime()).toBe(start.getTime());
    expect(range.finalDate.getTime()).toBe(end.getTime());
  });

  it('accepts a one-day range (equal)', () => {
    expect(() => DateRange.create(start, start)).not.toThrow();
  });

  it('rejects start > end', () => {
    expect(() => DateRange.create(end, start)).toThrow(ValidationError);
  });

  it('contains respeita os limites (inclusivo)', () => {
    const range = DateRange.create(start, end);
    expect(range.contains(new Date('2026-01-15'))).toBe(true);
    expect(range.contains(start)).toBe(true);
    expect(range.contains(end)).toBe(true);
    expect(range.contains(new Date('2026-02-01'))).toBe(false);
  });

  it('does not leak a mutable reference to the dates', () => {
    const range = DateRange.create(start, end);
    const before = range.initialDate.getTime();
    range.initialDate.setFullYear(1999);
    expect(range.initialDate.getTime()).toBe(before);
  });
});
