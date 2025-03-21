import { MaskAmountGateway } from '@/domain/Masks/MaskNumbers/gateway/mask-amount.gateway';
import { BillDTO } from '../dtos/bill.dto';

export type BillEntitieProps = BillDTO;

export class BillEntitie {
  private static maskAmountGateway?: MaskAmountGateway;
  private constructor(private props: BillEntitieProps) {}

  public static setMaskAmountGateway(maskAmountGateway: MaskAmountGateway) {
    this.maskAmountGateway = maskAmountGateway;
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
    paymentStatusId,
    paymentStatusDescription,
    categoryId,
    categoryDescription,
    paymentMethodId,
    paymentMethodDescription,
    isPaymentCardBill = false,
    invoiceCarData,
    isShoppingListBill = false,
    shoppingListData,
    createdAt,
  }: Omit<BillEntitieProps, 'updatedAt' | 'id'>) {
    const maskedAmount = this.unMaskAmount(amount);

    return new BillEntitie({
      personUserId,
      userId,
      descriptionBill,
      fixedBill,
      billDate,
      payDate,
      payOut,
      icon,
      amount: maskedAmount,
      paymentStatusId,
      paymentStatusDescription,
      categoryId,
      categoryDescription,
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

  private static unMaskAmount(amount: number) {
    if (!BillEntitie.maskAmountGateway) {
      throw new Error(
        'MaskAmountGateway is not set. Please configure it first.',
      );
    }

    const amountUnmasked = BillEntitie.maskAmountGateway.mask(amount).unmask;

    return amountUnmasked ? +amountUnmasked : 0;
  }

  public static with(props: BillEntitieProps) {
    const maskedAmount = this.unMaskAmount(props.amount);

    return new BillEntitie({ ...props, amount: maskedAmount });
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
    return this.props.payDate;
  }

  public get payOut() {
    return this.props.payOut;
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
