import { ValidationError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { Money } from '@/shared/kernel/value-objects/money.vo';
import {
  WalletMovementDirection,
  WalletMovementDirectionEnum,
  WalletMovementRefType,
  WalletMovementRefTypeEnum,
} from '@/features/wallet/domain/enums/wallet-movement.enums';

interface WalletMovementProps {
  id: string;
  userId: string;
  walletId: string;
  direction: WalletMovementDirection;
  amount: Money;
  refType: WalletMovementRefType;
  refId: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface WalletMovementPersistence {
  id: string;
  userId: string;
  walletId: string;
  direction: WalletMovementDirection;
  amount: number;
  refType: WalletMovementRefType;
  refId: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface WalletMovementOutput {
  id: string;
  walletId: string;
  direction: WalletMovementDirection;
  amount: number;
  refType: WalletMovementRefType;
  refId: string | null;
  occurredAt: string;
  createdAt: string;
}

const DIRECTIONS = new Set<string>(Object.values(WalletMovementDirectionEnum));
const REF_TYPES = new Set<string>(Object.values(WalletMovementRefTypeEnum));

/**
 * Movimento de caixa imutável e append-only (W4/W9): nunca editado nem
 * deletado — correção é movimento inverso. Espelha o `paymentHistory` de
 * Transaction.
 */
export class WalletMovement {
  private constructor(private readonly props: WalletMovementProps) {}

  public static create(input: {
    id: string;
    userId: string;
    walletId: string;
    direction: WalletMovementDirection;
    amount: Money;
    refType: WalletMovementRefType;
    refId: string | null;
    occurredAt: string;
    createdAt: string;
  }): WalletMovement {
    WalletMovement.validateProps(input);
    return new WalletMovement({ ...input });
  }

  public static with(persistence: WalletMovementPersistence): WalletMovement {
    return new WalletMovement({
      ...persistence,
      amount: Money.create(persistence.amount),
    });
  }

  private static validateProps(props: {
    direction: WalletMovementDirection;
    amount: Money;
    refType: WalletMovementRefType;
  }): void {
    if (!DIRECTIONS.has(props.direction))
      throw new ValidationError(ErrorCode.VALIDATION_FAILED);
    if (!REF_TYPES.has(props.refType))
      throw new ValidationError(ErrorCode.VALIDATION_FAILED);
    if (props.amount.isZero())
      throw new ValidationError(ErrorCode.MONEY_NEGATIVE);
  }

  public get id(): string {
    return this.props.id;
  }

  public get direction(): WalletMovementDirection {
    return this.props.direction;
  }

  public get amount(): Money {
    return this.props.amount;
  }

  public get refType(): WalletMovementRefType {
    return this.props.refType;
  }

  public get occurredAt(): string {
    return this.props.occurredAt;
  }

  public toPersistence(): WalletMovementPersistence {
    return {
      id: this.props.id,
      userId: this.props.userId,
      walletId: this.props.walletId,
      direction: this.props.direction,
      amount: this.props.amount.value,
      refType: this.props.refType,
      refId: this.props.refId,
      occurredAt: this.props.occurredAt,
      createdAt: this.props.createdAt,
    };
  }

  public toOutput(): WalletMovementOutput {
    return {
      id: this.props.id,
      walletId: this.props.walletId,
      direction: this.props.direction,
      amount: this.props.amount.value,
      refType: this.props.refType,
      refId: this.props.refId,
      occurredAt: this.props.occurredAt,
      createdAt: this.props.createdAt,
    };
  }
}
