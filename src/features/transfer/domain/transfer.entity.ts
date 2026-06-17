import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { Money } from '@/shared/kernel/value-objects/money.vo';

interface TransferProps {
  id: string;
  userId: string;
  fromWalletId: string;
  toWalletId: string;
  amount: Money;
  paymentMethodDescriptionEnum: string;
  transferDate: string;
  createdAt: string;
}

export interface TransferPersistence {
  id: string;
  userId: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  paymentMethodDescriptionEnum: string;
  transferDate: string;
  createdAt: string;
}

export interface TransferOutput {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  paymentMethodDescriptionEnum: string;
  transferDate: string;
  createdAt: string;
}

/**
 * Transferência imutável e neutra entre duas carteiras do mesmo usuário (T1/T3):
 * sem `updatedAt`/`deletedAt`, sem rota de edição/deleção. Correção é estorno
 * (capítulo futuro). Nunca toca o transaction-engine.
 */
export class Transfer {
  private constructor(private readonly props: TransferProps) {}

  public static create(input: {
    id: string;
    userId: string;
    fromWalletId: string;
    toWalletId: string;
    amount: Money;
    paymentMethodDescriptionEnum: string;
    transferDate: string;
    createdAt: string;
  }): Transfer {
    Transfer.validateProps(input);
    return new Transfer({ ...input });
  }

  public static with(persistence: TransferPersistence): Transfer {
    return new Transfer({
      ...persistence,
      amount: Money.create(persistence.amount),
    });
  }

  private static validateProps(props: {
    fromWalletId: string;
    toWalletId: string;
    amount: Money;
    transferDate: string;
    createdAt: string;
  }): void {
    if (props.fromWalletId === props.toWalletId)
      throw new ValidationError(ErrorCode.TRANSFER_SAME_WALLET);
    if (props.amount.isZero())
      throw new ValidationError(ErrorCode.TRANSFER_AMOUNT_NOT_POSITIVE);
    if (props.transferDate > props.createdAt.slice(0, 10))
      throw new ValidationError(ErrorCode.TRANSFER_DATE_IN_FUTURE);
  }

  public get id(): string {
    return this.props.id;
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get fromWalletId(): string {
    return this.props.fromWalletId;
  }

  public get toWalletId(): string {
    return this.props.toWalletId;
  }

  public get amount(): Money {
    return this.props.amount;
  }

  public get transferDate(): string {
    return this.props.transferDate;
  }

  public toPersistence(): TransferPersistence {
    return {
      id: this.props.id,
      userId: this.props.userId,
      fromWalletId: this.props.fromWalletId,
      toWalletId: this.props.toWalletId,
      amount: this.props.amount.value,
      paymentMethodDescriptionEnum: this.props.paymentMethodDescriptionEnum,
      transferDate: this.props.transferDate,
      createdAt: this.props.createdAt,
    };
  }

  public toOutput(): TransferOutput {
    return {
      id: this.props.id,
      fromWalletId: this.props.fromWalletId,
      toWalletId: this.props.toWalletId,
      amount: this.props.amount.value,
      paymentMethodDescriptionEnum: this.props.paymentMethodDescriptionEnum,
      transferDate: this.props.transferDate,
      createdAt: this.props.createdAt,
    };
  }
}
