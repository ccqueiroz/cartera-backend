import { Firestore } from 'firebase-admin/firestore';
import {
  PaymentStatusCatalog,
  PaymentStatusCatalogPersistence,
} from '@/features/payment-status/domain/payment-status-catalog.entity';
import { PaymentStatusRepository } from '@/features/payment-status/domain/ports/payment-status.repository.port';
import { PaymentStatusCode } from '@/shared/kernel/enums/payment-status.enum';

export class PaymentStatusRepositoryFirestore
  implements PaymentStatusRepository
{
  private static readonly COLLECTION = 'Payment_Status';

  private constructor(private readonly db: Firestore) {}

  public static create(db: Firestore): PaymentStatusRepositoryFirestore {
    return new PaymentStatusRepositoryFirestore(db);
  }

  public async listAll(): Promise<PaymentStatusCatalog[]> {
    const query = await this.collection().get();
    return query.docs.map((doc) =>
      PaymentStatusCatalog.with(doc.data() as PaymentStatusCatalogPersistence),
    );
  }

  public async findByCode(
    code: PaymentStatusCode,
  ): Promise<PaymentStatusCatalog | null> {
    const query = await this.collection()
      .where('code', '==', code)
      .limit(1)
      .get();
    if (query.empty) return null;
    return PaymentStatusCatalog.with(
      query.docs[0].data() as PaymentStatusCatalogPersistence,
    );
  }

  private collection() {
    return this.db.collection(PaymentStatusRepositoryFirestore.COLLECTION);
  }
}
