import { OVERDRAFT_IOF_ANNUAL_CEILING } from '@/features/wallet/domain/overdraft-defaults';

/**
 * Fator diário composto do cheque-especial (base FEBRABAN 2026, W13). O IOF
 * entra DIRETO no fator (fórmula literal): `f = 1 + i_m/30 + IOF_diário`, com o
 * IOF limitado pelo teto anual.
 */
export function overdraftDailyFactor(
  monthlyRate: number,
  iofDailyRate: number,
): number {
  const iof = Math.min(iofDailyRate, OVERDRAFT_IOF_ANNUAL_CEILING);
  return 1 + monthlyRate / 30 + iof;
}

/**
 * Juros acumulados sobre a série diária do saldo devedor (W13). Cada dia
 * compõe o devedor anterior e soma o novo saque (delta de principal) do dia,
 * ambos rendendo no dia. `jurosAcumulados = devedorCompostoAtéHoje − principalUsado`.
 * Para principal constante P por d dias equivale a `P × f^d − P`.
 */
export function accruedInterestFromOutstanding(
  outstandingByInterestDay: number[],
  monthlyRate: number,
  iofDailyRate: number,
): number {
  if (outstandingByInterestDay.length === 0) return 0;
  const factor = overdraftDailyFactor(monthlyRate, iofDailyRate);
  let compounded = 0;
  let previousPrincipal = 0;
  for (const principal of outstandingByInterestDay) {
    const draw = principal - previousPrincipal;
    compounded = (compounded + draw) * factor;
    previousPrincipal = principal;
  }
  const accrued = compounded - previousPrincipal;
  return Math.max(0, Number(accrued.toFixed(2)));
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function addDays(date: string, amount: number): string {
  const base = new Date(`${date}T00:00:00.000Z`);
  return new Date(base.getTime() + amount * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
}

/** Lista de datas `YYYY-MM-DD` de `from` a `to` inclusive; vazio se `from > to`. */
export function listDays(from: string, to: string): string[] {
  const days: string[] = [];
  let cursor = from;
  while (cursor <= to) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}
