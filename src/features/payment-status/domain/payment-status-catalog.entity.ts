import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import {
  PaymentStatusCode,
  PaymentStatusEnum,
} from '@/shared/kernel/enums/payment-status.enum';

interface PaymentStatusCatalogProps {
  id: string;
  code: PaymentStatusCode;
  label: string;
  createdAt: string;
}

export interface PaymentStatusCatalogPersistence {
  id: string;
  code: PaymentStatusCode;
  label: string;
  createdAt: string;
}

export interface PaymentStatusCatalogOutput {
  id: string;
  code: PaymentStatusCode;
  label: string;
}

const CODES = new Set<string>(Object.values(PaymentStatusEnum));

export class PaymentStatusCatalog {
  private constructor(private readonly props: PaymentStatusCatalogProps) {}

  public static create(input: {
    id: string;
    code: PaymentStatusCode;
    label: string;
    createdAt: string;
  }): PaymentStatusCatalog {
    PaymentStatusCatalog.validateProps(input);
    return new PaymentStatusCatalog({ ...input });
  }

  public static with(
    persistence: PaymentStatusCatalogPersistence,
  ): PaymentStatusCatalog {
    return new PaymentStatusCatalog({ ...persistence });
  }

  private static validateProps(props: PaymentStatusCatalogProps): void {
    if (!CODES.has(props.code))
      throw new ValidationError(ErrorCode.INVALID_PAYMENT_STATUS_CODE);
    if (!props.label.trim())
      throw new ValidationError(ErrorCode.PAYMENT_STATUS_LABEL_REQUIRED);
  }

  public get code(): PaymentStatusCode {
    return this.props.code;
  }

  public toOutput(): PaymentStatusCatalogOutput {
    return {
      id: this.props.id,
      code: this.props.code,
      label: this.props.label,
    };
  }
}
