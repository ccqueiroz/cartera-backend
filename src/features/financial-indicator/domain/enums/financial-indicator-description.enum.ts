/**
 * Indicadores padronizados globais (taxas/alíquotas de referência do mercado
 * brasileiro). A chave NÃO carrega ano — a vigência mora em `refPeriodMonth`/
 * `refPeriodYear` e o registro vigente é o `active === true`. Um job futuro
 * captura esses valores na web e insere novos documentos por período.
 */
export enum FinancialIndicatorDescriptionEnum {
  SELIC = 'SELIC',
  CDI = 'CDI',
  IPCA = 'IPCA',
  INPC = 'INPC',
  IOF_CREDIT_PF = 'IOF_CREDIT_PF',
  IOF_CREDIT_PJ = 'IOF_CREDIT_PJ',
  IOF_EXCHANGE = 'IOF_EXCHANGE',
  IOF_INTERNATIONAL_CARD = 'IOF_INTERNATIONAL_CARD',
  LATE_PAYMENT_INTEREST = 'LATE_PAYMENT_INTEREST',
  LATE_PAYMENT_FINE = 'LATE_PAYMENT_FINE',
  CREDIT_CARD_REVOLVING = 'CREDIT_CARD_REVOLVING',
  CREDIT_CARD_INSTALLMENT = 'CREDIT_CARD_INSTALLMENT',
}

export type FinancialIndicatorDescription =
  `${FinancialIndicatorDescriptionEnum}`;
