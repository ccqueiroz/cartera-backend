import { Document } from './document.vo';
import { BusinessRuleViolationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const VALID_CPF = '39053344705';
const VALID_CNPJ = '11222333000181';

const captureError = (fn: () => unknown): any => {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error('esperava que lançasse');
};

describe('Document', () => {
  it('cria CPF válido guardando só dígitos', () => {
    const document = Document.create({ type: 'CPF', value: '390.533.447-05' });
    expect(document.type).toBe('CPF');
    expect(document.value).toBe(VALID_CPF);
  });

  it('cria CNPJ válido guardando só dígitos', () => {
    const document = Document.create({
      type: 'CNPJ',
      value: '11.222.333/0001-81',
    });
    expect(document.type).toBe('CNPJ');
    expect(document.value).toBe(VALID_CNPJ);
  });

  it('rejeita dígito verificador inválido com INVALID_DOCUMENT', () => {
    expect(() =>
      Document.create({ type: 'CPF', value: '39053344700' }),
    ).toThrow(BusinessRuleViolationError);

    const error = captureError(() =>
      Document.create({ type: 'CNPJ', value: '11222333000100' }),
    );
    expect(error.code).toBe(ErrorCode.INVALID_DOCUMENT);
  });

  it('rejeita contagem de dígitos incompatível com o type declarado', () => {
    const cpfWithCnpjDigits = captureError(() =>
      Document.create({ type: 'CPF', value: VALID_CNPJ }),
    );
    expect(cpfWithCnpjDigits).toBeInstanceOf(BusinessRuleViolationError);
    expect(cpfWithCnpjDigits.code).toBe(ErrorCode.DOCUMENT_TYPE_MISMATCH);

    const cnpjWithCpfDigits = captureError(() =>
      Document.create({ type: 'CNPJ', value: VALID_CPF }),
    );
    expect(cnpjWithCpfDigits.code).toBe(ErrorCode.DOCUMENT_TYPE_MISMATCH);
  });

  it('mascara CPF como 999.xxx.xxx-99 (3 primeiros e 2 últimos visíveis)', () => {
    const document = Document.create({ type: 'CPF', value: VALID_CPF });
    expect(document.toMasked()).toBe('390.xxx.xxx-05');
  });

  it('mascara CNPJ como 99.xxx.xxx/xxxx-99 (2 primeiros e 2 últimos visíveis)', () => {
    const document = Document.create({ type: 'CNPJ', value: VALID_CNPJ });
    expect(document.toMasked()).toBe('11.xxx.xxx/xxxx-81');
  });
});
