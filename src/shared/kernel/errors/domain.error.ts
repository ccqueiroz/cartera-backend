/**
 * Erros de domínio puros. NÃO conhecem HTTP/status — o mapeamento para status
 * acontece na borda (ErrorMiddleware). Ver CLAUDE.md §4 regra 5.
 */
export abstract class DomainError extends Error {
  public override readonly name: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends DomainError {}

export class BusinessRuleViolationError extends DomainError {}

export class EntityNotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with ID ${id} not found.`);
  }
}

export class DuplicateEntityError extends DomainError {
  constructor(entity: string, identifier: string) {
    super(`${entity} already exists with identifier: ${identifier}.`);
  }
}

export class UnauthorizedError extends DomainError {}
