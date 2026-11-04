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

  [ErrorCode.ATTRIBUTE_MUST_BE_TEXT]: (params) =>
    `${params?.attribute} deve ser um texto.`,
  [ErrorCode.ATTRIBUTE_MUST_BE_NUMERIC_TEXT]: (params) =>
    `${params?.attribute} deve ser um texto numérico.`,
  [ErrorCode.ATTRIBUTE_MUST_BE_DATE]: (params) =>
    `${params?.attribute} deve estar no formato YYYY-MM-DD.`,
  [ErrorCode.PARAMETER_DOES_NOT_ACCEPT_FIELD]: (params) =>
    `O parâmetro ${params?.attribute} não aceita o campo ${params?.value}.`,
  [ErrorCode.PARAMETER_MUST_BE_ASC_OR_DESC]: (params) =>
    `O parâmetro ${params?.attribute} deve ser asc ou desc.`,
  [ErrorCode.PARAMETER_MUST_BE_DATE_OR_DATE_RANGE]: (params) =>
    `O parâmetro ${params?.attribute} deve ser YYYY-MM-DD ou YYYY-MM-DD-YYYY-MM-DD.`,
  [ErrorCode.PARAMETER_START_DATE_AFTER_END_DATE]: (params) =>
    `O parâmetro ${params?.attribute} tem a data inicial depois da final.`,
  [ErrorCode.ATTRIBUTE_MUST_BE_NUMBER]: (params) =>
    `${params?.attribute} deve ser um número.`,
  [ErrorCode.ATTRIBUTE_MUST_BE_BOOLEAN_MASCULINE]: (params) =>
    `${params?.attribute} deve ser booleano.`,
  [ErrorCode.ATTRIBUTE_MUST_BE_BOOLEAN_FEMININE]: (params) =>
    `${params?.attribute} deve ser booleana.`,
  [ErrorCode.ATTRIBUTE_MUST_BE_OBJECT]: (params) =>
    `${params?.attribute} deve ser um objeto.`,
  [ErrorCode.ATTRIBUTE_MUST_BE_LIST]: (params) =>
    `${params?.attribute} devem ser uma lista.`,
  [ErrorCode.ATTRIBUTE_MUST_BE_ID_LIST]: (params) =>
    `${params?.attribute} deve ser uma lista de ids.`,
  [ErrorCode.ATTRIBUTE_IS_REQUIRED_ON_SETTLEMENT]: (params) =>
    `${params?.attribute} é obrigatória na liquidação.`,
  [ErrorCode.ATTRIBUTE_IS_REQUIRED_ON_PAYOFF]: (params) =>
    `${params?.attribute} é obrigatória na quitação.`,
  [ErrorCode.ATTRIBUTE_IS_REQUIRED_ON_RECEIPT]: (params) =>
    `${params?.attribute} é obrigatória no recebimento.`,
  [ErrorCode.AT_LEAST_ONE_INSTALLMENT_REQUIRED]: () =>
    'Informe ao menos uma parcela.',
  [ErrorCode.INVALID_PAYMENT_METHOD]: () => 'Forma de pagamento inválida.',
  [ErrorCode.ATTRIBUTE_MUST_BE_A_BOOLEAN]: (params) =>
    `${params?.attribute} deve ser um booleano.`,
  [ErrorCode.ATTRIBUTE_MUST_BE_WHOLE_DAYS]: (params) =>
    `${params?.attribute} deve ser um número inteiro de dias.`,
  [ErrorCode.ATTRIBUTE_MUST_NOT_BE_NEGATIVE_FEMININE]: (params) =>
    `${params?.attribute} não pode ser negativa.`,
  [ErrorCode.ATTRIBUTE_MUST_NOT_BE_NEGATIVE_MASCULINE]: (params) =>
    `${params?.attribute} não pode ser negativo.`,
  [ErrorCode.ATTRIBUTE_MUST_NOT_BE_EMPTY_MASCULINE]: (params) =>
    `${params?.attribute} não pode ser vazio.`,
  [ErrorCode.ATTRIBUTE_MUST_BE_GREATER_THAN_ZERO]: (params) =>
    `${params?.attribute} deve ser maior que zero.`,
  [ErrorCode.ATTRIBUTE_MUST_BE_DEPOSIT_OR_WITHDRAW]: (params) =>
    `${params?.attribute} deve ser DEPOSIT ou WITHDRAW.`,
  [ErrorCode.ATTRIBUTE_IS_REQUIRED_FEMININE]: (params) =>
    `${params?.attribute} é obrigatória.`,
  [ErrorCode.ATTRIBUTE_IS_INVALID_FEMININE]: (params) =>
    `${params?.attribute} é inválida.`,
  [ErrorCode.ATTRIBUTE_IS_INVALID_MASCULINE]: (params) =>
    `${params?.attribute} é inválido.`,
  [ErrorCode.ATTRIBUTE_EXCEEDS_MAX_LENGTH]: (params) =>
    `${params?.attribute} excede o tamanho máximo (${params?.max}).`,
  [ErrorCode.ATTRIBUTE_IS_REQUIRED_MASCULINE]: (params) =>
    `${params?.attribute} é obrigatório.`,
  [ErrorCode.ATTRIBUTE_MUST_NOT_BE_EMPTY_FEMININE]: (params) =>
    `${params?.attribute} não pode ser vazia.`,
  [ErrorCode.ATTRIBUTE_BELOW_MIN_LENGTH]: (params) =>
    `${params?.attribute} deve ter no mínimo ${params?.min} caracteres.`,
  [ErrorCode.ATTRIBUTE_MUST_BE_BASE64]: (params) =>
    `${params?.attribute} deve ser enviada como base64.`,
  [ErrorCode.ATTRIBUTE_MUST_BE_CPF_OR_CNPJ]: (params) =>
    `${params?.attribute} deve ser CPF ou CNPJ.`,
  [ErrorCode.ATTRIBUTE_REQUIRES_WALLET_ID]: (params) =>
    `${params?.attribute} exige walletId.`,
  [ErrorCode.ATTRIBUTE_REQUIRES_CARD_ID]: (params) =>
    `${params?.attribute} exige cardId.`,
  [ErrorCode.ATTRIBUTE_WILL_BE_HANDLED_BY_INVOICE]: (params) =>
    `${params?.attribute} será tratada pela fatura (recurso ainda não disponível).`,
  [ErrorCode.ATTRIBUTE_MUST_NOT_BE_BEFORE_START_DATE]: (params) =>
    `${params?.attribute} não pode ser anterior a start_date.`,
  [ErrorCode.ATTRIBUTES_ARE_REQUIRED]: (params) =>
    `${params?.attribute} são obrigatórios.`,

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

  [ErrorCode.TRANSFER_NOT_FOUND]: () => 'Transferência não encontrada.',
  [ErrorCode.TRANSFER_SAME_WALLET]: () =>
    'A carteira de origem e a de destino devem ser diferentes.',
  [ErrorCode.TRANSFER_AMOUNT_NOT_POSITIVE]: () =>
    'O valor da transferência deve ser maior que zero.',
  [ErrorCode.TRANSFER_DATE_IN_FUTURE]: () =>
    'A data da transferência não pode ser futura.',
  [ErrorCode.TRANSFER_PAYMENT_METHOD_INACTIVE]: () =>
    'A forma de pagamento informada não está ativa no catálogo.',

  [ErrorCode.WALLET_NOT_FOUND]: () => 'Carteira não encontrada.',
  [ErrorCode.WALLET_DELETED]: () =>
    'Esta carteira foi removida e não pode mais ser operada.',
  [ErrorCode.WALLET_HAS_BALANCE]: () =>
    'A carteira possui saldo diferente de zero. Confirme a exclusão para prosseguir.',
  [ErrorCode.WALLET_NOT_DELETABLE]: () =>
    'A carteira Cartera é a representação do seu dinheiro e não pode ser excluída.',
  [ErrorCode.WALLET_DEFAULT_NO_OVERDRAFT]: () =>
    'A carteira Cartera é caixa puro e não pode ter cheque-especial.',
  [ErrorCode.WALLET_NAME_REQUIRED]: () => 'O nome da carteira é obrigatório.',
  [ErrorCode.OVERDRAFT_LIMIT_REQUIRED]: () =>
    'Para ativar o cheque-especial, informe um limite maior que zero.',
  [ErrorCode.INVALID_OVERDRAFT_CONFIG]: () =>
    'A configuração do cheque-especial é inválida (limite, taxa, IOF e carência não podem ser negativos).',
  [ErrorCode.INVALID_WALLET_ADJUST_AMOUNT]: () =>
    'O valor do ajuste de saldo deve ser maior que zero.',

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

  [ErrorCode.SETTLEMENT_MOVEMENT_NOT_FOUND]: () =>
    'Não foi possível estornar: o movimento de caixa desta liquidação não foi encontrado.',

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
