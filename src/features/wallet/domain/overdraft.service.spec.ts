import {
  accruedInterestFromOutstanding,
  addDays,
  listDays,
  overdraftDailyFactor,
} from './overdraft.service';

describe('overdraft.service', () => {
  describe('overdraftDailyFactor', () => {
    it('soma IOF direto no fator (fórmula literal W13)', () => {
      expect(overdraftDailyFactor(0.1, 0.0038)).toBeCloseTo(1.0071333, 6);
    });

    it('limita o IOF pelo teto anual 0.2988', () => {
      expect(overdraftDailyFactor(0, 0.5)).toBeCloseTo(1.2988, 6);
    });
  });

  describe('accruedInterestFromOutstanding', () => {
    it('caso de referência: R$ 1.000, 10%/mês, IOF 0.0038, 15 dias ⇒ ~R$ 112,5', () => {
      const outstanding = Array<number>(15).fill(1000);
      const accrued = accruedInterestFromOutstanding(outstanding, 0.1, 0.0038);
      expect(accrued).toBeCloseTo(112.5, 0);
    });

    it('sem dias com juros ⇒ 0 (carência cobre o episódio)', () => {
      expect(accruedInterestFromOutstanding([], 0.1, 0.0038)).toBe(0);
    });

    it('principal variável rende mais que o constante menor', () => {
      const constant = accruedInterestFromOutstanding(
        Array<number>(10).fill(1000),
        0.1,
        0.0038,
      );
      const growing = accruedInterestFromOutstanding(
        [...Array<number>(5).fill(1000), ...Array<number>(5).fill(2000)],
        0.1,
        0.0038,
      );
      expect(growing).toBeGreaterThan(constant);
      expect(Number.isFinite(growing)).toBe(true);
    });

    it('nunca retorna negativo', () => {
      expect(
        accruedInterestFromOutstanding([1000, 0, 0], 0.1, 0.0038),
      ).toBeGreaterThanOrEqual(0);
    });
  });

  describe('date helpers', () => {
    it('addDays atravessa virada de mês', () => {
      expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
      expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    });

    it('listDays é inclusivo e vazio quando from > to', () => {
      expect(listDays('2026-06-10', '2026-06-12')).toEqual([
        '2026-06-10',
        '2026-06-11',
        '2026-06-12',
      ]);
      expect(listDays('2026-06-12', '2026-06-10')).toEqual([]);
    });
  });
});
