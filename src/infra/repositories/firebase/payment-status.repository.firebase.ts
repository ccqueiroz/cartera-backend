import * as admin from 'firebase-admin';
import { PaymentStatusDTO } from '@/domain/Payment_Status/dtos/payment-status.dto';
import { PaymentStatusRepositoryGateway } from '@/domain/Payment_Status/gateway/payment-status.respository.gateway';
import { ErrorsFirebase } from '../../database/firebase/errorHandling';
import { PaymentStatusEntitie } from '@/domain/Payment_Status/entitie/payment-status.entitie';

export class PaymentStatusRepositoryFirebase
  implements PaymentStatusRepositoryGateway
{
  private static instance: PaymentStatusRepositoryFirebase;
  private dbCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
  private collection = 'Payment_Status';

  private constructor(private readonly db: admin.firestore.Firestore) {
    this.dbCollection = this.db.collection(this.collection);
  }

  public static create(db: admin.firestore.Firestore) {
    if (!PaymentStatusRepositoryFirebase.instance) {
      PaymentStatusRepositoryFirebase.instance =
        new PaymentStatusRepositoryFirebase(db);
    }
    return PaymentStatusRepositoryFirebase.instance;
  }

  public async getPaymentStatus(): Promise<Array<PaymentStatusDTO>> {
    const data = await this.dbCollection
      .get()
      .then((response) =>
        response.docs?.map(
          (item) => ({ id: item.id, ...item.data() } as PaymentStatusDTO),
        ),
      )
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    return data as Array<PaymentStatusDTO>;
  }

  public async getPaymentStatusById({
    id,
  }: Pick<PaymentStatusDTO, 'id'>): Promise<PaymentStatusDTO | null> {
    const paymentStatus = await this.dbCollection
      .doc(id)
      .get()
      .then((response) =>
        response.exists
          ? {
              id: response.id,
              ...(response.data() as Omit<PaymentStatusDTO, 'id'>),
            }
          : null,
      )
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    return paymentStatus
      ? PaymentStatusEntitie.with({ ...paymentStatus })
      : null;
  }
}
