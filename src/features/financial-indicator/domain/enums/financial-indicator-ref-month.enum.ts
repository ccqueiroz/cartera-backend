/**
 * Mês de competência da vigência. Opcional: ausente (null) ⇒ a taxa vale para o
 * ano inteiro (`refPeriodYear`); presente ⇒ vale para aquele mês/ano específico.
 */
export enum FinancialIndicatorRefMonthEnum {
  JAN = 'JAN',
  FEV = 'FEV',
  MAR = 'MAR',
  ABR = 'ABR',
  MAI = 'MAI',
  JUN = 'JUN',
  JUL = 'JUL',
  AGO = 'AGO',
  SET = 'SET',
  OUT = 'OUT',
  NOV = 'NOV',
  DEZ = 'DEZ',
}

export type FinancialIndicatorRefMonth = `${FinancialIndicatorRefMonthEnum}`;
