import * as admin from 'firebase-admin';
import { PaymentMethodDTO } from '@/domain/Payment_Method/dtos/payment-method.dto';
import { PaymentMethodRepositoryGateway } from '@/domain/Payment_Method/gateway/payment-method.repository.gateway';
import { ErrorsFirebase } from '../../database/firebase/errorHandling';
import { PaymentMethodEntitie } from '@/domain/Payment_Method/entitie/payment-method.entitie';

export class PaymentMethodRepositoryFirebase
  implements PaymentMethodRepositoryGateway
{
  private static instance: PaymentMethodRepositoryFirebase;
  private dbCollection: admin.firestore.CollectionReference<admin.firestore.DocumentData>;
  private collection = 'Payment_Method';

  private constructor(private readonly db: admin.firestore.Firestore) {
    this.dbCollection = this.db.collection(this.collection);
  }

  public static create(db: admin.firestore.Firestore) {
    if (!PaymentMethodRepositoryFirebase.instance) {
      PaymentMethodRepositoryFirebase.instance =
        new PaymentMethodRepositoryFirebase(db);
    }
    return PaymentMethodRepositoryFirebase.instance;
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
          descriptionEnum: response.descriptionEnum,
          createdAt: response.createdAt,
          updatedAt: response.updatedAt,
        }
      : response;
  }
}
