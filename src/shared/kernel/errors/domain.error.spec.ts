import {
  DomainError,
  ValidationError,
  BusinessRuleViolationError,
  EntityNotFoundError,
  DuplicateEntityError,
  PayloadTooLargeError,
} from './domain.error';
import { ErrorCode } from './error-code';
import { errorCatalog } from './error-catalog';

describe('domain errors', () => {
  it('ValidationError is a DomainError and carries code/params/name', () => {
    const details = errorCatalog[ErrorCode.ATTRIBUTE_MUST_BE_TEXT]({
      attribute: 'name',
    });
    const error = new ValidationError(ErrorCode.VALIDATION_FAILED, {
      details,
    });
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ValidationError');
    expect(error.code).toBe(ErrorCode.VALIDATION_FAILED);
    expect(error.params).toEqual({ details });
  });

  it('technical message equals the code (useful in log/stack)', () => {
    const error = new EntityNotFoundError(ErrorCode.CATEGORY_NOT_FOUND, {
      descriptionEnum: 'UBER',
    });
    expect(error.message).toBe(ErrorCode.CATEGORY_NOT_FOUND);
    expect(error.code).toBe(ErrorCode.CATEGORY_NOT_FOUND);
    expect(error.params).toEqual({ descriptionEnum: 'UBER' });
  });

  it('each subclass keeps its own name', () => {
    expect(
      new BusinessRuleViolationError(ErrorCode.VALIDATION_FAILED).name,
    ).toBe('BusinessRuleViolationError');
    expect(
      new DuplicateEntityError(ErrorCode.CATEGORY_ALREADY_EXISTS).name,
    ).toBe('DuplicateEntityError');
  });

  it('PayloadTooLargeError is a DomainError and keeps its own name', () => {
    const error = new PayloadTooLargeError(ErrorCode.AVATAR_TOO_LARGE);
    expect(error).toBeInstanceOf(DomainError);
    expect(error.name).toBe('PayloadTooLargeError');
    expect(error.code).toBe(ErrorCode.AVATAR_TOO_LARGE);
  });

  it('params is optional', () => {
    const error = new ValidationError(ErrorCode.INVALID_CATEGORY_TYPE);
    expect(error.params).toBeUndefined();
  });
});
