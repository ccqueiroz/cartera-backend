import { ErrorCode } from './error-code';
import { errorCatalog } from './error-catalog';

describe('errorCatalog', () => {
  const codes = Object.values(ErrorCode);

  it('cada ErrorCode resolve uma string PT não-vazia', () => {
    for (const code of codes) {
      const message = errorCatalog[code]();
      expect(typeof message).toBe('string');
      expect(message.trim().length).toBeGreaterThan(0);
    }
  });

  it('não há código sem entrada nem entrada órfã', () => {
    const catalogKeys = Object.keys(errorCatalog).sort();
    expect(catalogKeys).toEqual([...codes].sort());
  });

  it('interpola placeholders nos params', () => {
    const message = errorCatalog[ErrorCode.CATEGORY_NOT_FOUND]({
      descriptionEnum: 'UBER',
    });
    expect(message).toContain('UBER');
  });

  it('códigos do fluxo de auth resolvem mensagem PT não-vazia', () => {
    for (const code of [ErrorCode.TOKEN_EXPIRED, ErrorCode.ACCOUNT_DELETED]) {
      expect(errorCatalog[code]().trim().length).toBeGreaterThan(0);
    }
  });

  it('VALIDATION_FAILED interpola details', () => {
    const message = errorCatalog[ErrorCode.VALIDATION_FAILED]({
      details: 'description não pode ser vazio',
    });
    expect(message).toContain('description não pode ser vazio');
  });

  it.each([
    ErrorCode.ATTRIBUTE_MUST_BE_TEXT,
    ErrorCode.ATTRIBUTE_MUST_BE_NUMERIC_TEXT,
    ErrorCode.ATTRIBUTE_MUST_BE_DATE,
  ])('[BK2-58] %s puts the attribute into the message', (code) => {
    expect(errorCatalog[code]({ attribute: 'start_date' })).toContain(
      'start_date',
    );
  });

  it.each([
    ErrorCode.PARAMETER_DOES_NOT_ACCEPT_FIELD,
    ErrorCode.PARAMETER_MUST_BE_ASC_OR_DESC,
    ErrorCode.PARAMETER_MUST_BE_DATE_OR_DATE_RANGE,
    ErrorCode.PARAMETER_START_DATE_AFTER_END_DATE,
  ])('[BK2-58] %s puts the parameter name into the message', (code) => {
    expect(errorCatalog[code]({ attribute: 'any_parameter' })).toContain(
      'any_parameter',
    );
  });

  it('[BK2-58] PARAMETER_DOES_NOT_ACCEPT_FIELD puts the sent field into the message', () => {
    const message = errorCatalog[ErrorCode.PARAMETER_DOES_NOT_ACCEPT_FIELD]({
      attribute: 'any_parameter',
      value: 'any_field',
    });
    expect(message).toContain('any_field');
  });

  it.each([
    ErrorCode.ATTRIBUTE_MUST_BE_NUMBER,
    ErrorCode.ATTRIBUTE_MUST_BE_BOOLEAN_MASCULINE,
    ErrorCode.ATTRIBUTE_MUST_BE_BOOLEAN_FEMININE,
    ErrorCode.ATTRIBUTE_MUST_BE_OBJECT,
    ErrorCode.ATTRIBUTE_MUST_BE_LIST,
    ErrorCode.ATTRIBUTE_MUST_BE_ID_LIST,
    ErrorCode.ATTRIBUTE_IS_REQUIRED_ON_SETTLEMENT,
    ErrorCode.ATTRIBUTE_IS_REQUIRED_ON_PAYOFF,
  ])('[BK2-58] %s puts the bill field label into the message', (code) => {
    expect(errorCatalog[code]({ attribute: 'any_label' })).toContain(
      'any_label',
    );
  });

  it.each([ErrorCode.ATTRIBUTE_IS_REQUIRED_ON_RECEIPT])(
    '[BK2-58] %s puts the receivable field label into the message',
    (code) => {
      expect(errorCatalog[code]({ attribute: 'any_label' })).toContain(
        'any_label',
      );
    },
  );
});
