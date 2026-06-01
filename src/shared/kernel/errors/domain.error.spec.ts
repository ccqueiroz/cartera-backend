import {
  DomainError,
  ValidationError,
  BusinessRuleViolationError,
  EntityNotFoundError,
  DuplicateEntityError,
} from './domain.error';

describe('domain errors', () => {
  it('ValidationError é DomainError e carrega o nome da classe', () => {
    const err = new ValidationError('invalid');
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ValidationError');
    expect(err.message).toBe('invalid');
  });

  it('BusinessRuleViolationError mantém o nome próprio', () => {
    expect(new BusinessRuleViolationError('rule').name).toBe(
      'BusinessRuleViolationError',
    );
  });

  it('EntityNotFoundError formata mensagem', () => {
    expect(new EntityNotFoundError('Bill', '42').message).toBe(
      'Bill with ID 42 not found.',
    );
  });

  it('DuplicateEntityError formata mensagem', () => {
    expect(new DuplicateEntityError('Card', 'visa').message).toBe(
      'Card already exists with identifier: visa.',
    );
  });
});
