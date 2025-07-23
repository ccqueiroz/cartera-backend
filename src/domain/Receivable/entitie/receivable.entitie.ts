import { MaskAmountGateway } from '@/domain/Masks/MaskNumbers/gateway/mask-amount.gateway';
import { ReceivableDTO } from '../dtos/receivable.dto';
import { ApiError } from '@/helpers/errors';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';
import { PaymentStatusEntitie } from '@/domain/Payment_Status/entitie/payment-status.entitie';

export type ReceivableEntitieProps = ReceivableDTO;

export class ReceivableEntitie {
  private static maskAmountGateway?: MaskAmountGateway;
  private constructor(private props: ReceivableEntitieProps) {}

  public static setMaskAmountGateway(maskAmountGateway: MaskAmountGateway) {
    this.maskAmountGateway = maskAmountGateway;
  }

  private static validateProps(props: Partial<ReceivableEntitieProps>) {
    if (!props.receivableDate) {
      throw new ApiError(
        'Receivable Date is not set. Please set the Receivable date.',
        400,
      );
    }

    if (props.amount == null) {
      throw new ApiError('Amount is required.', 400);
    }

    if (!ReceivableEntitie.maskAmountGateway) {
      throw new ApiError(
        'MaskAmountGateway is not set. Please configure it first.',
        400,
      );
    }
  }

  public static create({
    personUserId,
    userId,
    descriptionReceivable,
    fixedReceivable,
    receivableDate,
    receivalDate = null,
    receival = false,
    icon,
    amount,
    categoryId,
    categoryDescription,
    categoryDescriptionEnum,
    categoryGroup,
    paymentMethodId = undefined,
    paymentMethodDescription = undefined,
    paymentMethodDescriptionEnum = undefined,
    createdAt,
  }: Omit<ReceivableEntitieProps, 'updatedAt' | 'id' | 'paymentStatus'>) {
    this.validateProps({ receivableDate, amount });

    return new ReceivableEntitie({
      personUserId,
      userId,
      descriptionReceivable,
      fixedReceivable,
      receivableDate,
      receivalDate,
      receival,
      icon,
      amount,
      paymentStatus: PaymentStatusDescriptionEnum.TO_RECEIVE,
      categoryId,
      categoryDescription,
      categoryDescriptionEnum,
      categoryGroup,
      paymentMethodId,
      paymentMethodDescription,
      paymentMethodDescriptionEnum,
      createdAt,
      updatedAt: null,
    });
  }

  private unMaskAmount(amount: number) {
    const amountUnmasked =
      ReceivableEntitie.maskAmountGateway?.mask(amount).unmask;
    return amountUnmasked ? +amountUnmasked : 0;
  }

  private setPaymentStatus(wasPaid: boolean, receivableDate: number) {
    const currentDay = new Date().getTime();
    return PaymentStatusEntitie.setInvoiceStatus(
      wasPaid,
      receivableDate,
      currentDay,
      'receivable',
    );
  }

  public static with(props: Omit<ReceivableEntitieProps, 'paymentStatus'>) {
    this.validateProps({
      receivableDate: props.receivableDate,
      amount: props.amount,
    });

    return new ReceivableEntitie({
      ...props,
      paymentStatus: PaymentStatusDescriptionEnum.TO_RECEIVE,
    });
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

  public get receivalDate() {
    return this.props.receival ? this.props.receivalDate : null;
  }

  public get receival() {
    return this.props.receival;
  }

  public get icon() {
    return this.props.icon;
  }

  public get amount() {
    const maskedAmount = this.unMaskAmount(this.props.amount);
    return maskedAmount;
  }

  public get paymentStatus() {
    const definePaymentStatus = this.setPaymentStatus(
      this.props.receival,
      this.props.receivableDate as number,
    );

    return definePaymentStatus;
  }

  public get categoryId() {
    return this.props.categoryId;
  }

  public get categoryDescription() {
    return this.props.categoryDescription;
  }

  public get categoryDescriptionEnum() {
    return this.props.categoryDescriptionEnum;
  }

  public get categoryGroup() {
    return this.props.categoryGroup;
  }

  public get paymentMethodId() {
    return this.props.receival ? this.props.paymentMethodId : undefined;
  }

  public get paymentMethodDescription() {
    return this.props.receival
      ? this.props.paymentMethodDescription
      : undefined;
  }

  public get paymentMethodDescriptionEnum() {
    return this.props.receival
      ? this.props.paymentMethodDescriptionEnum
      : undefined;
  }

  public get createdAt() {
    return this.props.createdAt;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }
}
