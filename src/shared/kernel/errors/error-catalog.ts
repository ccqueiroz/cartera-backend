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

  [ErrorCode.PERSON_NOT_FOUND]: () => 'Perfil não encontrado.',
  [ErrorCode.PERSON_ALREADY_EXISTS]: () =>
    'Já existe um perfil para esta conta.',
  [ErrorCode.DOCUMENT_ALREADY_IN_USE]: () =>
    'O documento informado já está em uso por outro perfil.',
  [ErrorCode.INVALID_DOCUMENT]: () => 'O documento informado é inválido.',
  [ErrorCode.DOCUMENT_TYPE_MISMATCH]: () =>
    'O documento informado não corresponde ao tipo declarado.',
  [ErrorCode.INVALID_PHONE]: () => 'O telefone informado é inválido.',
  [ErrorCode.AVATAR_UNSUPPORTED_TYPE]: () =>
    'Formato de imagem não suportado. Envie um arquivo JPEG ou PNG.',
  [ErrorCode.AVATAR_TOO_LARGE]: () =>
    'A imagem excede o tamanho máximo de 5MB.',
  [ErrorCode.AVATAR_UPLOAD_FAILED]: () =>
    'Não foi possível enviar a imagem. Tente novamente.',

  [ErrorCode.MONEY_INVALID_NUMBER]: () =>
    'O valor monetário deve ser um número válido.',
  [ErrorCode.MONEY_NEGATIVE]: () => 'O valor monetário não pode ser negativo.',
  [ErrorCode.INVALID_DATE_RANGE]: () =>
    'A data inicial deve ser anterior ou igual à data final.',

  [ErrorCode.TRANSACTION_NOT_FOUND]: () => 'Transação não encontrada.',
  [ErrorCode.TRANSACTION_SETTLE_ON_INTERNAL]: () =>
    'Não é possível quitar diretamente um nó com filhas; quite as folhas.',
  [ErrorCode.TRANSACTION_ALREADY_PAID]: () => 'A transação já está quitada.',
  [ErrorCode.TRANSACTION_REVERSE_ON_INTERNAL]: () =>
    'Não é possível estornar um nó com filhas.',
  [ErrorCode.TRANSACTION_REVERSE_ENTRY]: () =>
    'A entrada do parcelamento não é estornável; corrija por edição ou exclusão.',
  [ErrorCode.TRANSACTION_ALREADY_REVERSED]: () =>
    'A transação já foi estornada.',
  [ErrorCode.TRANSACTION_REVERSE_NOT_PAID]: () =>
    'Não é possível estornar uma transação que não está quitada.',
  [ErrorCode.TRANSACTION_REPARCEL_PAID_LEAF]: () =>
    'Uma folha já paga é imutável e não pode ser reparcelada.',
  [ErrorCode.TRANSACTION_INVALID_INSTALLMENT_COUNT]: () =>
    'O número de parcelas deve ser maior ou igual a 1.',
  [ErrorCode.TRANSACTION_ENTRY_EXCEEDS_TOTAL]: () =>
    'O valor da entrada não pode ser maior ou igual ao valor total.',
  [ErrorCode.TRANSACTION_INVALID_FIXED_COST]: () =>
    'Não foi possível salvar a recorrência. Confira o período e a frequência informados.',

  [ErrorCode.INVALID_TOKEN]: () => 'Token de autorização inválido.',
  [ErrorCode.TOKEN_EXPIRED]: () => 'Sessão expirada. Renove o token de acesso.',
  [ErrorCode.INVALID_CREDENTIALS]: () => 'Credenciais inválidas.',
  [ErrorCode.INVALID_EMAIL]: () => 'E-mail inválido.',
  [ErrorCode.TOO_MANY_REQUESTS]: () =>
    'O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.',
  [ErrorCode.TIMEOUT]: () => 'O tempo de espera para a operação foi excedido.',
  [ErrorCode.USER_DISABLED]: () => 'Conta do usuário desativada.',
  [ErrorCode.ACCOUNT_DELETED]: () =>
    'Esta conta foi encerrada e não pode mais ser acessada.',
  [ErrorCode.USER_NOT_FOUND]: () => 'Usuário não encontrado.',
  [ErrorCode.ACCOUNT_NOT_FOUND]: () => 'Conta não encontrada.',
  [ErrorCode.EMAIL_NOT_FOUND]: () => 'E-mail não encontrado.',
  [ErrorCode.EMAIL_ALREADY_IN_USE]: () =>
    'O e-mail fornecido já está em uso por outra conta.',
};
