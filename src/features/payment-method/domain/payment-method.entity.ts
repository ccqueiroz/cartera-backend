import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import {
  PaymentMethodDescription,
  PaymentMethodDescriptionEnum,
} from '@/features/payment-method/domain/enums/payment-method-description.enum';

const DESCRIPTION_MAX_LENGTH = 60;
const DESCRIPTION_ENUMS = new Set<string>(
  Object.values(PaymentMethodDescriptionEnum),
);

interface PaymentMethodProps {
  id: string;
  description: string;
  descriptionEnum: PaymentMethodDescription;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface PaymentMethodPersistence {
  id: string;
  description: string;
  descriptionEnum: PaymentMethodDescription;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface PaymentMethodOutput {
  id: string;
  description: string;
  descriptionEnum: PaymentMethodDescription;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export class PaymentMethod {
  private constructor(private props: PaymentMethodProps) {}

  public static create(input: {
    id: string;
    description: string;
    descriptionEnum: PaymentMethodDescription;
    createdAt: string;
  }): PaymentMethod {
    const props: PaymentMethodProps = {
      ...input,
      updatedAt: null,
      deletedAt: null,
    };
    PaymentMethod.validateProps(props);
    return new PaymentMethod(props);
  }

  public static with(persistence: PaymentMethodPersistence): PaymentMethod {
    return new PaymentMethod({ ...persistence });
  }

  private static validateProps(props: PaymentMethodProps): void {
    if (!props.description.trim())
      throw new ValidationError(ErrorCode.PAYMENT_METHOD_DESCRIPTION_REQUIRED);
    if (props.description.trim().length > DESCRIPTION_MAX_LENGTH)
      throw new ValidationError(ErrorCode.PAYMENT_METHOD_DESCRIPTION_TOO_LONG);
    if (!DESCRIPTION_ENUMS.has(props.descriptionEnum))
      throw new ValidationError(
        ErrorCode.INVALID_PAYMENT_METHOD_DESCRIPTION_ENUM,
      );
  }

  public updateDescription(description: string, updatedAt: string): void {
    const next: PaymentMethodProps = { ...this.props, description, updatedAt };
    PaymentMethod.validateProps(next);
    this.props = next;
  }

  public softDelete(deletedAt: string): void {
    if (this.props.deletedAt !== null) return;
    this.props.deletedAt = deletedAt;
    this.props.updatedAt = deletedAt;
  }

  public get id(): string {
    return this.props.id;
  }

  public get descriptionEnum(): PaymentMethodDescription {
    return this.props.descriptionEnum;
  }

  public get isActive(): boolean {
    return this.props.deletedAt === null;
  }

  public toPersistence(): PaymentMethodPersistence {
    return {
      id: this.props.id,
      description: this.props.description,
      descriptionEnum: this.props.descriptionEnum,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      deletedAt: this.props.deletedAt,
    };
  }

  public toOutput(): PaymentMethodOutput {
    return {
      id: this.props.id,
      description: this.props.description,
      descriptionEnum: this.props.descriptionEnum,
      active: this.isActive,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
