import { Firestore } from 'firebase-admin/firestore';
import {
  PaymentMethod,
  PaymentMethodPersistence,
} from '@/features/payment-method/domain/payment-method.entity';
import { PaymentMethodRepository } from '@/features/payment-method/domain/ports/payment-method.repository.port';
import { PaymentMethodDescription } from '@/features/payment-method/domain/enums/payment-method-description.enum';

export class PaymentMethodRepositoryFirestore
  implements PaymentMethodRepository
{
  private static readonly COLLECTION = 'Payment_Method';

  private constructor(private readonly db: Firestore) {}

  public static create(db: Firestore): PaymentMethodRepositoryFirestore {
    return new PaymentMethodRepositoryFirestore(db);
  }

  public async create(method: PaymentMethod): Promise<void> {
    const data = method.toPersistence();
    await this.collection().doc(data.id).set(data);
  }

  public async findActiveByEnum(
    descriptionEnum: PaymentMethodDescription,
  ): Promise<PaymentMethod | null> {
    const query = await this.collection()
      .where('descriptionEnum', '==', descriptionEnum)
      .where('deletedAt', '==', null)
      .limit(1)
      .get();
    if (query.empty) return null;
    return PaymentMethod.with(query.docs[0].data() as PaymentMethodPersistence);
  }

  public async findLatestByEnum(
    descriptionEnum: PaymentMethodDescription,
  ): Promise<PaymentMethod | null> {
    const active = await this.findActiveByEnum(descriptionEnum);
    if (active) return active;

    const query = await this.collection()
      .where('descriptionEnum', '==', descriptionEnum)
      .orderBy('deletedAt', 'desc')
      .limit(1)
      .get();
    if (query.empty) return null;
    return PaymentMethod.with(query.docs[0].data() as PaymentMethodPersistence);
  }

  public async findById(id: string): Promise<PaymentMethod | null> {
    const doc = await this.collection().doc(id).get();
    if (!doc.exists) return null;
    return PaymentMethod.with(doc.data() as PaymentMethodPersistence);
  }

  public async listActive(): Promise<PaymentMethod[]> {
    const query = await this.collection().where('deletedAt', '==', null).get();
    return query.docs.map((doc) =>
      PaymentMethod.with(doc.data() as PaymentMethodPersistence),
    );
  }

  public async update(method: PaymentMethod): Promise<void> {
    const data = method.toPersistence();
    await this.collection().doc(data.id).set(data);
  }

  public async softDelete(method: PaymentMethod): Promise<void> {
    const data = method.toPersistence();
    await this.collection().doc(data.id).set(data);
  }

  private collection() {
    return this.db.collection(PaymentMethodRepositoryFirestore.COLLECTION);
  }
}
