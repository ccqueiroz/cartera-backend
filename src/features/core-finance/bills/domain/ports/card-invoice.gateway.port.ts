/**
 * Contrato (sem implementação nesta change) da anexação de compra de cartão à
 * fatura (B6/B7). O adapter e os casos de uso de fatura/`PayInvoice` vivem em
 * `historia-card-invoice`; aqui só o tipo existe para o caminho `CREDIT_CARD` +
 * `cardId`. Sem adapter wired, uma compra de cartão de crédito é barrada na borda
 * até a feature de fatura existir.
 */
export interface AttachToInvoiceCommand {
  userId: string;
  cardId: string;
  leafId: string;
  amount: number;
  dueDate: string;
}

export interface CardInvoiceGateway {
  attachPurchase(command: AttachToInvoiceCommand): Promise<void>;
}
