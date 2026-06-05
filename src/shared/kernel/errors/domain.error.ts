import { ErrorCode } from './error-code';

export type ErrorParams = Record<string, string | number>;

/**
 * Erros de domínio puros. NÃO conhecem HTTP/status nem texto de apresentação —
 * carregam um `ErrorCode` (eixo mensagem) e a classe (eixo status). O catálogo
 * resolve o PT-BR e o ErrorMiddleware mapeia a classe para status, na borda.
 * Ver CLAUDE.md §4 regra 5.
 */
export abstract class DomainError extends Error {
  public override readonly name: string;
  public readonly code: ErrorCode;
  public readonly params?: ErrorParams;

  constructor(code: ErrorCode, params?: ErrorParams) {
    super(code);
    this.name = this.constructor.name;
    this.code = code;
    this.params = params;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends DomainError {}

export class BusinessRuleViolationError extends DomainError {}

export class EntityNotFoundError extends DomainError {}

export class DuplicateEntityError extends DomainError {}

export class PayloadTooLargeError extends DomainError {}

export class UnauthorizedError extends DomainError {}

export class ForbiddenError extends DomainError {}
