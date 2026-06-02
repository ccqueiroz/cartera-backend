import {
  DomainError,
  ValidationError,
  BusinessRuleViolationError,
  EntityNotFoundError,
  DuplicateEntityError,
} from './domain.error';
import { ErrorCode } from './error-code';

describe('domain errors', () => {
  it('ValidationError é DomainError e carrega code/params/name', () => {
    const error = new ValidationError(ErrorCode.VALIDATION_FAILED, {
      details: 'x',
    });
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ValidationError');
    expect(error.code).toBe(ErrorCode.VALIDATION_FAILED);
    expect(error.params).toEqual({ details: 'x' });
  });

  it('message técnico é igual ao code (útil em log/stack)', () => {
    const error = new EntityNotFoundError(ErrorCode.CATEGORY_NOT_FOUND, {
      descriptionEnum: 'UBER',
    });
    expect(error.message).toBe(ErrorCode.CATEGORY_NOT_FOUND);
    expect(error.code).toBe(ErrorCode.CATEGORY_NOT_FOUND);
    expect(error.params).toEqual({ descriptionEnum: 'UBER' });
  });

  it('cada subclasse mantém o próprio name', () => {
    expect(
      new BusinessRuleViolationError(ErrorCode.VALIDATION_FAILED).name,
    ).toBe('BusinessRuleViolationError');
    expect(
      new DuplicateEntityError(ErrorCode.CATEGORY_ALREADY_EXISTS).name,
    ).toBe('DuplicateEntityError');
  });

  it('params é opcional', () => {
    const error = new ValidationError(ErrorCode.INVALID_CATEGORY_TYPE);
    expect(error.params).toBeUndefined();
  });
});
