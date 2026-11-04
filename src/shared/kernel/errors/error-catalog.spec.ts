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
    const details = errorCatalog[
      ErrorCode.ATTRIBUTE_MUST_NOT_BE_EMPTY_MASCULINE
    ]({
      attribute: 'description',
    });
    const message = errorCatalog[ErrorCode.VALIDATION_FAILED]({ details });
    expect(message).toContain(details);
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

  it.each([
    ErrorCode.ATTRIBUTE_MUST_BE_A_BOOLEAN,
    ErrorCode.ATTRIBUTE_MUST_BE_WHOLE_DAYS,
    ErrorCode.ATTRIBUTE_MUST_NOT_BE_NEGATIVE_FEMININE,
    ErrorCode.ATTRIBUTE_MUST_NOT_BE_NEGATIVE_MASCULINE,
    ErrorCode.ATTRIBUTE_MUST_NOT_BE_EMPTY_MASCULINE,
    ErrorCode.ATTRIBUTE_MUST_BE_GREATER_THAN_ZERO,
    ErrorCode.ATTRIBUTE_MUST_BE_DEPOSIT_OR_WITHDRAW,
    ErrorCode.ATTRIBUTE_IS_REQUIRED_FEMININE,
    ErrorCode.ATTRIBUTE_IS_INVALID_FEMININE,
  ])('[BK2-58] %s puts the schema field label into the message', (code) => {
    expect(errorCatalog[code]({ attribute: 'any_label' })).toContain(
      'any_label',
    );
  });

  it.each([
    ErrorCode.ATTRIBUTE_IS_INVALID_MASCULINE,
    ErrorCode.ATTRIBUTE_EXCEEDS_MAX_LENGTH,
  ])('[BK2-58] %s puts the registry field label into the message', (code) => {
    expect(errorCatalog[code]({ attribute: 'any_label' })).toContain(
      'any_label',
    );
  });

  it('[BK2-58] ATTRIBUTE_EXCEEDS_MAX_LENGTH puts the max length into the message', () => {
    const message = errorCatalog[ErrorCode.ATTRIBUTE_EXCEEDS_MAX_LENGTH]({
      attribute: 'any_label',
      max: 60,
    });
    expect(message).toContain('60');
  });

  it.each([
    ErrorCode.ATTRIBUTE_IS_REQUIRED_MASCULINE,
    ErrorCode.ATTRIBUTE_MUST_NOT_BE_EMPTY_FEMININE,
    ErrorCode.ATTRIBUTE_BELOW_MIN_LENGTH,
    ErrorCode.ATTRIBUTE_MUST_BE_BASE64,
    ErrorCode.ATTRIBUTE_MUST_BE_CPF_OR_CNPJ,
  ])('[BK2-58] %s puts the account field label into the message', (code) => {
    expect(errorCatalog[code]({ attribute: 'any_label' })).toContain(
      'any_label',
    );
  });

  it('[BK2-58] ATTRIBUTE_BELOW_MIN_LENGTH puts the min length into the message', () => {
    const message = errorCatalog[ErrorCode.ATTRIBUTE_BELOW_MIN_LENGTH]({
      attribute: 'any_label',
      min: 6,
    });
    expect(message).toContain('6');
  });

  it.each([
    ErrorCode.ATTRIBUTE_REQUIRES_WALLET_ID,
    ErrorCode.ATTRIBUTE_REQUIRES_CARD_ID,
    ErrorCode.ATTRIBUTE_WILL_BE_HANDLED_BY_INVOICE,
    ErrorCode.ATTRIBUTE_MUST_NOT_BE_BEFORE_START_DATE,
    ErrorCode.ATTRIBUTES_ARE_REQUIRED,
  ])(
    '[BK2-58] %s puts the use case or entity subject into the message',
    (code) => {
      expect(errorCatalog[code]({ attribute: 'any_label' })).toContain(
        'any_label',
      );
    },
  );
});
