/** Periodicidade da alíquota: como o valor de `aliquota` deve ser lido/aplicado. */
export enum FinancialIndicatorPeriodEnum {
  DAILY = 'diario',
  MONTHLY = 'mensal',
  YEARLY = 'anual',
}

export type FinancialIndicatorPeriod = `${FinancialIndicatorPeriodEnum}`;
