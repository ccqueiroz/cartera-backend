import { MaskAmountGateway } from '@/domain/Masks/MaskNumbers/gateway/mask-amount.gateway';
import { ReceivableDTO } from '../dtos/receivable.dto';

export type ReceivableEntitieProps = ReceivableDTO;

export class ReceivableEntitie {
  private static maskAmountGateway?: MaskAmountGateway;
  private constructor(private props: ReceivableEntitieProps) {}

  public static setMaskAmountGateway(maskAmountGateway: MaskAmountGateway) {
    this.maskAmountGateway = maskAmountGateway;
  }

  public static create({
    personUserId,
    userId,
    descriptionReceivable,
    fixedReceivable,
    receivableDate,
    icon,
    amount,
    paymentStatusId,
    paymentStatusDescription,
    categoryId,
    categoryDescription,
    paymentMethodId,
    paymentMethodDescription,
    createdAt,
  }: Omit<ReceivableEntitieProps, 'updatedAt' | 'id'>) {
    const maskedAmount = this.unMaskAmount(amount);

    return new ReceivableEntitie({
      personUserId,
      userId,
      descriptionReceivable,
      fixedReceivable,
      receivableDate,
      icon,
      amount: maskedAmount,
      paymentStatusId,
      paymentStatusDescription,
      categoryId,
      categoryDescription,
      paymentMethodId,
      paymentMethodDescription,
      createdAt,
      updatedAt: null,
    });
  }

  private static unMaskAmount(amount: number) {
    if (!ReceivableEntitie.maskAmountGateway) {
      throw new Error(
        'MaskAmountGateway is not set. Please configure it first.',
      );
    }

    const amountUnmasked =
      ReceivableEntitie.maskAmountGateway.mask(amount).unmask;

    return amountUnmasked ? +amountUnmasked : 0;
  }

  public static with(props: ReceivableEntitieProps) {
    const maskedAmount = this.unMaskAmount(props.amount);

    return new ReceivableEntitie({ ...props, amount: maskedAmount });
  }

  public get id() {
    return this.props.id;
  }

  public get personUserId() {
    return this.props.personUserId;
  }

  public get userId() {
    return this.props.userId;
  }

  public get descriptionReceivable() {
    return this.props.descriptionReceivable;
  }

  public get fixedReceivable() {
    return this.props.fixedReceivable;
  }

  public get receivableDate() {
    return this.props.receivableDate;
  }

  public get icon() {
    return this.props.icon;
  }

  public get amount() {
    return this.props.amount;
  }

  public get paymentStatusId() {
    return this.props.paymentStatusId;
  }

  public get paymentStatusDescription() {
    return this.props.paymentStatusDescription;
  }

  public get categoryId() {
    return this.props.categoryId;
  }

  public get categoryDescription() {
    return this.props.categoryDescription;
  }

  public get paymentMethodId() {
    return this.props.paymentMethodId;
  }

  public get paymentMethodDescription() {
    return this.props.paymentMethodDescription;
  }

  public get createdAt() {
    return this.props.createdAt;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }
}
