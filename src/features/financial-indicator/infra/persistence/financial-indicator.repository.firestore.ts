import { Firestore } from 'firebase-admin/firestore';
import {
  FinancialIndicator,
  FinancialIndicatorPersistence,
} from '@/features/financial-indicator/domain/financial-indicator.entity';
import { FinancialIndicatorRepository } from '@/features/financial-indicator/domain/ports/financial-indicator.repository.port';
import { FinancialIndicatorDescription } from '@/features/financial-indicator/domain/enums/financial-indicator-description.enum';

export class FinancialIndicatorRepositoryFirestore
  implements FinancialIndicatorRepository
{
  private static readonly COLLECTION = 'Financial_Indicator';

  private constructor(private readonly db: Firestore) {}

  public static create(db: Firestore): FinancialIndicatorRepositoryFirestore {
    return new FinancialIndicatorRepositoryFirestore(db);
  }

  public async findActiveByEnum(
    descriptionEnum: FinancialIndicatorDescription,
  ): Promise<FinancialIndicator | null> {
    const query = await this.collection()
      .where('descriptionEnum', '==', descriptionEnum)
      .where('active', '==', true)
      .where('deletedAt', '==', null)
      .limit(1)
      .get();
    if (query.empty) return null;
    return FinancialIndicator.with(
      query.docs[0].data() as FinancialIndicatorPersistence,
    );
  }

  private collection() {
    return this.db.collection(FinancialIndicatorRepositoryFirestore.COLLECTION);
  }
}
