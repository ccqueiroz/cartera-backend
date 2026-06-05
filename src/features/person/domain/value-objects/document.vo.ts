import { BusinessRuleViolationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { validatorsPackage } from '@/packages/validators';

export type DocumentType = 'CPF' | 'CNPJ';

const DIGIT_COUNT_BY_TYPE: Record<DocumentType, number> = {
  CPF: 11,
  CNPJ: 14,
};

export class Document {
  private constructor(
    public readonly type: DocumentType,
    public readonly value: string,
  ) {}

  public static create(input: { type: DocumentType; value: string }): Document {
    const digits = input.value.replace(/\D/g, '');

    if (digits.length !== DIGIT_COUNT_BY_TYPE[input.type])
      throw new BusinessRuleViolationError(ErrorCode.DOCUMENT_TYPE_MISMATCH);

    const isValid =
      input.type === 'CPF'
        ? validatorsPackage.cpf(digits)
        : validatorsPackage.cnpj(digits);
    if (!isValid)
      throw new BusinessRuleViolationError(ErrorCode.INVALID_DOCUMENT);

    return new Document(input.type, digits);
  }

  public toMasked(): string {
    if (this.type === 'CPF')
      return `${this.value.slice(0, 3)}.xxx.xxx-${this.value.slice(9)}`;
    return `${this.value.slice(0, 2)}.xxx.xxx/xxxx-${this.value.slice(12)}`;
  }
}
