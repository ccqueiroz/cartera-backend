import { PaymentMethodDTO } from '@/domain/Payment_Method/dtos/payment-method.dto';
import { PaymentMethodGateway } from '@/domain/Payment_Method/gateway/payment-method.gateway';
import firebase from 'firebase';
import { ErrorsFirebase } from '../database/firebase/errorHandling';
import { PaymentMethodEntitie } from '@/domain/Payment_Method/entitie/payment-method.entitie';

export class PaymentMethodRepositoryFirebase implements PaymentMethodGateway {
  private dbCollection: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
  private collection = 'Payment_Method';

  private constructor(private readonly db: firebase.firestore.Firestore) {
    this.dbCollection = this.db.collection(this.collection);
  }

  public static create(db: firebase.firestore.Firestore) {
    return new PaymentMethodRepositoryFirebase(db);
  }

  public async getPaymentMethods(): Promise<Array<PaymentMethodDTO>> {
    const data = await this.dbCollection
      .get()
      .then((response) =>
        response.docs?.map(
          (item) => ({ id: item.id, ...item.data() } as PaymentMethodDTO),
        ),
      )
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    return data as Array<PaymentMethodDTO>;
  }

  public async getPaymentMethodById({
    id,
  }: Pick<PaymentMethodDTO, 'id'>): Promise<PaymentMethodDTO | null> {
    const paymentMethod = await this.dbCollection
      .doc(id)
      .get()
      .then((response) =>
        response.exists
          ? {
              id: response.id,
              ...(response.data() as Omit<PaymentMethodDTO, 'id'>),
            }
          : null,
      )
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    const response = paymentMethod
      ? PaymentMethodEntitie.with({ ...paymentMethod })
      : null;

    return response
      ? {
          id: response.id,
          description: response.description,
          createdAt: response.createdAt,
          updatedAt: response.updatedAt,
        }
      : response;
  }
}
