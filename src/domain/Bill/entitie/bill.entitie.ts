import { MaskAmountGateway } from '@/domain/Masks/MaskNumbers/gateway/mask-amount.gateway';
import { BillDTO } from '../dtos/bill.dto';
import { PaymentStatusEntitie } from '@/domain/Payment_Status/entitie/payment-status.entitie';
import { ApiError } from '@/helpers/errors';

export type BillEntitieProps = BillDTO;

export class BillEntitie {
  private static maskAmountGateway?: MaskAmountGateway;
  private constructor(private props: BillEntitieProps) {}

  public static setMaskAmountGateway(maskAmountGateway: MaskAmountGateway) {
    this.maskAmountGateway = maskAmountGateway;
  }

  private static validateProps(props: Partial<BillEntitieProps>) {
    if (!props.billDate) {
      throw new ApiError(
        'Bill Date is not set. Please set the Bill date.',
        400,
      );
    }

    if (props.amount == null) {
      throw new ApiError('Amount is required.', 400);
    }

    if (!BillEntitie.maskAmountGateway) {
      throw new ApiError(
        'MaskAmountGateway is not set. Please configure it first.',
        400,
      );
    }
  }

  public static create({
    personUserId,
    userId,
    descriptionBill,
    fixedBill,
    billDate,
    payDate = null,
    payOut = false,
    icon,
    amount,
    categoryId,
    categoryDescription,
    categoryDescriptionEnum,
    categoryGroup,
    paymentStatus,
    paymentMethodId = undefined,
    paymentMethodDescription = undefined,
    isPaymentCardBill = false,
    invoiceCarData,
    isShoppingListBill = false,
    shoppingListData,
    createdAt,
  }: Omit<BillEntitieProps, 'updatedAt' | 'id'>) {
    this.validateProps({ billDate, amount });

    return new BillEntitie({
      personUserId,
      userId,
      descriptionBill,
      fixedBill,
      billDate,
      payDate,
      payOut,
      icon,
      amount,
      paymentStatus,
      categoryId,
      categoryDescription,
      categoryDescriptionEnum,
      categoryGroup,
      paymentMethodId,
      paymentMethodDescription,
      isPaymentCardBill,
      invoiceCarData,
      isShoppingListBill,
      shoppingListData,
      createdAt,
      updatedAt: null,
    });
  }

  public static with(props: BillEntitieProps) {
    this.validateProps({ billDate: props.billDate, amount: props.amount });

    return new BillEntitie({
      ...props,
    });
  }

  private unMaskAmount(amount: number) {
    const amountUnmasked = BillEntitie.maskAmountGateway?.mask(amount).unmask;

    return amountUnmasked ? +amountUnmasked : 0;
  }

  private setPaymentStatus(wasPaid: boolean, billDate: number) {
    const currentDay = new Date().getTime();
    return PaymentStatusEntitie.setInvoiceStatus(
      wasPaid,
      billDate,
      currentDay,
      'bill',
    );
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

  public get descriptionBill() {
    return this.props.descriptionBill;
  }

  public get fixedBill() {
    return this.props.fixedBill;
  }

  public get billDate() {
    return this.props.billDate;
  }

  public get payDate() {
    return this.props.payOut ? this.props.payDate : null;
  }

  public get payOut() {
    return this.props.payOut;
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
      this.props.payOut,
      this.props.billDate as number,
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
    return this.props.payOut ? this.props.paymentMethodId : undefined;
  }

  public get paymentMethodDescription() {
    return this.props.payOut ? this.props.paymentMethodDescription : undefined;
  }

  public get isPaymentCardBill() {
    return this.props.isPaymentCardBill;
  }

  public get invoiceCarData() {
    return this.props.invoiceCarData;
  }

  public get isShoppingListBill() {
    return this.props.isShoppingListBill;
  }

  public get shoppingListData() {
    return this.props.shoppingListData;
  }

  public get createdAt() {
    return this.props.createdAt;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }
}
