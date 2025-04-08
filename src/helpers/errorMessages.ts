export const ERROR_MESSAGES = {
  INVALID_TOKEN: 'Token de autorização inválido.',
  MISSING_REQUIRED_PARAMETERS: 'Parâmetros obrigatórios ausentes.',
  INVALID_CREDENTIALS: 'Credenciais Inválidas.',
  USER_ALREADY_EXISTS: 'Usuário já registrado.',
  USER_NOT_FOUND: 'Usuário não encontrado.',
  ACCOUNT_NOT_FOUND: 'Conta não encontrada.',
  INVALID_EMAIL: 'E-mail inválido.',
  TIMEOUT: 'O tempo de espera para a operação foi excedido.',
  TOO_MANY_REQUESTS:
    'O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login com falha. Tente novamente mais tarde.',
  EMAIL_ALREADY_IN_USE: 'O e-mail fornecido já está em uso por outra conta.',
  INTERNAL_SERVER_ERROR: 'Erro interno no servidor.',
  EMAIL_NOT_FOUND: 'E-mail não encontrado.',
  USER_DISABLED: 'Conta do usuário desativada.',
  PASSWORD_IS_DIFERENT_CONFIRM_PASSWORD:
    'A senha e a confirmação de senha não conferem.',
  CREATE_PERSON_USER_FAILED: 'Falha ao criar o usuário.',
  PAYMENT_METHOD_NOT_FOUND: 'Método de pagamento não encontrado.',
  CATEGORY_NOT_FOUND: 'Categoria não encontrada.',
  PAYMENT_STATUS_NOT_FOUND: 'Status não encontrada.',
  CATEGORY_NOT_EXIST:
    'O valor fornecido para o parâmetro "type" não corresponde a nenhuma categoria válida.',
  INVALID_CATEGORY_PAYMENT_METHOD_OR_PAYMENT_STATUS:
    'Categoria, Método de Pagamento ou Status de Pagamento inválidos.',
  RECEIVABLE_NOT_FOUND:
    'Nenhum valor a receber foi encontrado para o "id" fornecido. Verifique se o identificador está correto.',
  BILL_NOT_FOUND:
    'Nenhum conta/despesa foi encontrada para o "id" fornecido. Verifique se o identificador está correto.',
  INVALID_PERIOD:
    'Período de pesquisa inválido. Por favor, informe o período de análise.',
} as const;
