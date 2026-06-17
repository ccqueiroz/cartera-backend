/**
 * Porta que a wallet usa para ler taxas globais. O IOF do cheque-especial é
 * tributo federal (não é config por-carteira): vem do `Financial_Indicator`
 * ativo. O adapter (bootstrap) delega à feature financial-indicator — a wallet
 * nunca a importa direto.
 */
export interface FinancialIndicatorGateway {
  /** IOF diário vigente; cai no default `0.0038` quando não há indicador ativo. */
  getActiveIofDailyRate(): Promise<number>;
}
