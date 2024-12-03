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
} as const;
