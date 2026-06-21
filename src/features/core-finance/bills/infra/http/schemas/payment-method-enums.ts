/**
 * Conjunto fechado das formas de pagamento aceitas na borda. A validação só
 * confere chave conhecida; se está ativa no catálogo é decidido pelo motor (422).
 * Lista própria do slice para não importar o enum de payment-method (fronteira).
 */
export const PAYMENT_METHOD_ENUMS = [
  'DEBIT_CARD',
  'CREDIT_CARD',
  'BANK_SLIP',
  'BANK_DEPOSIT',
  'BANK_TRANSFER',
  'AUTOMATIC_DEBIT',
  'BOOKLET',
  'CASH',
  'CHECK',
  'PROMISSORY',
  'FINANCING',
  'MEAL_VOUCHER',
  'FOOD_VOUCHER',
  'PIX',
  'CRYPTOCURRENCY',
  'DIGITAL_WALLET',
];
