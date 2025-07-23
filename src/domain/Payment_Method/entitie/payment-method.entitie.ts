import { PaymentMethodDTO } from '../dtos/payment-method.dto';

export type PaymentMethodProps = PaymentMethodDTO;

export class PaymentMethodEntitie {
  private constructor(private props: PaymentMethodProps) {}

  public static with(props: PaymentMethodProps) {
    return new PaymentMethodEntitie(props);
  }

  public get id() {
    return this.props.id;
  }

  public get description() {
    return this.props.description;
  }

  public get descriptionEnum() {
    return this.props.descriptionEnum;
  }

  public get createdAt() {
    return this.props.createdAt;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }
}
