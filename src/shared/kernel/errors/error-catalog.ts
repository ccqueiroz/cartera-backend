import { ErrorCode } from './error-code';

export type MessageBuilder = (
  params?: Record<string, string | number>,
) => string;

export const errorCatalog: Record<ErrorCode, MessageBuilder> = {
  [ErrorCode.VALIDATION_FAILED]: (params) =>
    params?.details
      ? `Parâmetros de entrada inválidos: ${params.details}`
      : 'Parâmetros de entrada inválidos.',
  [ErrorCode.INTERNAL_SERVER_ERROR]: () => 'Erro interno no servidor.',

  [ErrorCode.CATEGORY_NOT_FOUND]: (params) =>
    params?.descriptionEnum
      ? `Categoria "${params.descriptionEnum}" não encontrada.`
      : 'Categoria não encontrada.',
  [ErrorCode.CATEGORY_ALREADY_EXISTS]: (params) =>
    params?.descriptionEnum
      ? `Categoria "${params.descriptionEnum}" já existe.`
      : 'Categoria já existe.',
  [ErrorCode.CATEGORY_DESCRIPTION_ENUM_IMMUTABLE]: () =>
    'O identificador da categoria (descriptionEnum) é imutável e não pode ser alterado.',
  [ErrorCode.CATEGORY_DESCRIPTION_REQUIRED]: () =>
    'A descrição da categoria é obrigatória.',
  [ErrorCode.INVALID_CATEGORY_DESCRIPTION_ENUM]: () =>
    'O valor fornecido para a categoria (descriptionEnum) é inválido.',
  [ErrorCode.INVALID_CATEGORY_GROUP]: () => 'Grupo de categoria inválido.',
  [ErrorCode.INVALID_CATEGORY_TYPE]: () => 'Tipo de categoria inválido.',

  [ErrorCode.PAYMENT_STATUS_NOT_FOUND]: (params) =>
    params?.code
      ? `Status de pagamento "${params.code}" não encontrado.`
      : 'Status de pagamento não encontrado.',
  [ErrorCode.PAYMENT_STATUS_LABEL_REQUIRED]: () =>
    'O rótulo do status de pagamento é obrigatório.',
  [ErrorCode.INVALID_PAYMENT_STATUS_CODE]: () =>
    'O código do status de pagamento é inválido.',

  [ErrorCode.PAYMENT_METHOD_NOT_FOUND]: (params) =>
    params?.descriptionEnum
      ? `Forma de pagamento "${params.descriptionEnum}" não encontrada.`
      : 'Forma de pagamento não encontrada.',
  [ErrorCode.PAYMENT_METHOD_ALREADY_EXISTS]: (params) =>
    params?.descriptionEnum
      ? `Já existe uma forma de pagamento ativa para "${params.descriptionEnum}".`
      : 'Forma de pagamento já existe.',
  [ErrorCode.PAYMENT_METHOD_DESCRIPTION_REQUIRED]: () =>
    'A descrição da forma de pagamento é obrigatória.',
  [ErrorCode.PAYMENT_METHOD_DESCRIPTION_TOO_LONG]: () =>
    'A descrição da forma de pagamento excede o tamanho máximo permitido.',
  [ErrorCode.INVALID_PAYMENT_METHOD_DESCRIPTION_ENUM]: () =>
    'O valor fornecido para a forma de pagamento (descriptionEnum) é inválido.',

  [ErrorCode.MONEY_INVALID_NUMBER]: () =>
    'O valor monetário deve ser um número válido.',
  [ErrorCode.MONEY_NEGATIVE]: () => 'O valor monetário não pode ser negativo.',
  [ErrorCode.INVALID_DATE_RANGE]: () =>
    'A data inicial deve ser anterior ou igual à data final.',

  [ErrorCode.INVALID_TOKEN]: () => 'Token de autorização inválido.',
  [ErrorCode.INVALID_CREDENTIALS]: () => 'Credenciais inválidas.',
  [ErrorCode.INVALID_EMAIL]: () => 'E-mail inválido.',
  [ErrorCode.TOO_MANY_REQUESTS]: () =>
    'O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.',
  [ErrorCode.TIMEOUT]: () => 'O tempo de espera para a operação foi excedido.',
  [ErrorCode.USER_DISABLED]: () => 'Conta do usuário desativada.',
  [ErrorCode.USER_NOT_FOUND]: () => 'Usuário não encontrado.',
  [ErrorCode.ACCOUNT_NOT_FOUND]: () => 'Conta não encontrada.',
  [ErrorCode.EMAIL_NOT_FOUND]: () => 'E-mail não encontrado.',
  [ErrorCode.EMAIL_ALREADY_IN_USE]: () =>
    'O e-mail fornecido já está em uso por outra conta.',
};
