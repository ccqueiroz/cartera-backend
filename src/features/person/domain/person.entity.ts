import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import {
  Document,
  DocumentType,
} from '@/features/person/domain/value-objects/document.vo';
import { Phone } from '@/features/person/domain/value-objects/phone.vo';

const BIRTH_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface PersonPhoneData {
  number: string;
  countryCode: string;
  isWhatsapp: boolean;
}

export interface PersonDocumentData {
  type: DocumentType;
  value: string;
}

export interface PersonMonthlyIncome {
  value: number | null;
  currency: string | null;
}

interface PersonProps {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: Phone | null;
  document: Document | null;
  avatarUrl: string | null;
  birthDate: string | null;
  occupation: string | null;
  monthlyIncome: PersonMonthlyIncome;
  defaultCurrency: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface PersonPersistence {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: PersonPhoneData | null;
  document: PersonDocumentData | null;
  avatarUrl: string | null;
  birthDate: string | null;
  occupation: string | null;
  monthlyIncome: PersonMonthlyIncome;
  defaultCurrency: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface PersonOutput {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: PersonPhoneData | null;
  document: PersonDocumentData | null;
  avatarUrl: string | null;
  birthDate: string | null;
  occupation: string | null;
  monthlyIncome: PersonMonthlyIncome;
  defaultCurrency: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface PersonUpdateInput {
  firstName?: string;
  lastName?: string;
  phone?: PersonPhoneData | null;
  document?: PersonDocumentData | null;
  birthDate?: string | null;
  occupation?: string | null;
  monthlyIncome?: PersonMonthlyIncome;
  defaultCurrency?: string | null;
}

export class Person {
  private constructor(private props: PersonProps) {}

  public static create(input: {
    id: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  }): Person {
    const props: PersonProps = {
      ...input,
      phone: null,
      document: null,
      avatarUrl: null,
      birthDate: null,
      occupation: null,
      monthlyIncome: { value: null, currency: null },
      defaultCurrency: null,
      updatedAt: null,
      deletedAt: null,
    };
    Person.validateProps(props);
    return new Person(props);
  }

  public static with(persistence: PersonPersistence): Person {
    return new Person({
      ...persistence,
      phone: persistence.phone ? Phone.create(persistence.phone) : null,
      document: persistence.document
        ? Document.create(persistence.document)
        : null,
    });
  }

  private static validateProps(props: PersonProps): void {
    if (!props.firstName.trim())
      throw new ValidationError(ErrorCode.VALIDATION_FAILED, {
        details: 'firstName é obrigatório',
      });
    if (!props.lastName.trim())
      throw new ValidationError(ErrorCode.VALIDATION_FAILED, {
        details: 'lastName é obrigatório',
      });
    if (props.birthDate !== null && !BIRTH_DATE_PATTERN.test(props.birthDate))
      throw new ValidationError(ErrorCode.VALIDATION_FAILED, {
        details: 'birthDate deve estar no formato YYYY-MM-DD',
      });
  }

  public update(input: PersonUpdateInput, updatedAt: string): void {
    const next: PersonProps = {
      ...this.props,
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.phone !== undefined && {
        phone: input.phone ? Phone.create(input.phone) : null,
      }),
      ...(input.document !== undefined && {
        document: input.document ? Document.create(input.document) : null,
      }),
      ...(input.birthDate !== undefined && { birthDate: input.birthDate }),
      ...(input.occupation !== undefined && { occupation: input.occupation }),
      ...(input.monthlyIncome !== undefined && {
        monthlyIncome: input.monthlyIncome,
      }),
      ...(input.defaultCurrency !== undefined && {
        defaultCurrency: input.defaultCurrency,
      }),
      updatedAt,
    };
    Person.validateProps(next);
    this.props = next;
  }

  public changeAvatar(avatarUrl: string, updatedAt: string): void {
    this.props.avatarUrl = avatarUrl;
    this.props.updatedAt = updatedAt;
  }

  public removeAvatar(updatedAt: string): void {
    this.props.avatarUrl = null;
    this.props.updatedAt = updatedAt;
  }

  public syncEmail(email: string, updatedAt: string): void {
    this.props.email = email;
    this.props.updatedAt = updatedAt;
  }

  public softDelete(deletedAt: string): void {
    if (this.props.deletedAt !== null) return;
    this.props.deletedAt = deletedAt;
    this.props.updatedAt = deletedAt;
  }

  public get id(): string {
    return this.props.id;
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get email(): string {
    return this.props.email;
  }

  public get document(): Document | null {
    return this.props.document;
  }

  public get avatarUrl(): string | null {
    return this.props.avatarUrl;
  }

  public get isActive(): boolean {
    return this.props.deletedAt === null;
  }

  public toPersistence(): PersonPersistence {
    return {
      id: this.props.id,
      userId: this.props.userId,
      email: this.props.email,
      firstName: this.props.firstName,
      lastName: this.props.lastName,
      phone: this.props.phone
        ? {
            number: this.props.phone.number,
            countryCode: this.props.phone.countryCode,
            isWhatsapp: this.props.phone.isWhatsapp,
          }
        : null,
      document: this.props.document
        ? { type: this.props.document.type, value: this.props.document.value }
        : null,
      avatarUrl: this.props.avatarUrl,
      birthDate: this.props.birthDate,
      occupation: this.props.occupation,
      monthlyIncome: { ...this.props.monthlyIncome },
      defaultCurrency: this.props.defaultCurrency,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      deletedAt: this.props.deletedAt,
    };
  }

  public toOutput(): PersonOutput {
    return {
      ...this.toPersistence(),
      document: this.props.document
        ? {
            type: this.props.document.type,
            value: this.props.document.toMasked(),
          }
        : null,
      fullName: `${this.props.firstName} ${this.props.lastName}`,
      isActive: this.isActive,
    };
  }
}
