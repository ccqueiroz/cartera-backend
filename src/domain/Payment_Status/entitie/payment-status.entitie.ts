import { PaymentStatusDTO } from '../dtos/payment-status.dto';

export type PaymentStatusProps = PaymentStatusDTO;

export class PaymentStatusEntitie {
  private constructor(private props: PaymentStatusProps) {}

  public static with(props: PaymentStatusProps) {
    return new PaymentStatusEntitie(props);
  }

  public get id() {
    return this.props.id;
  }

  public get description() {
    return this.props.description;
  }

  public get createdAt() {
    return this.props.createdAt;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }
}
