import { Firestore } from 'firebase-admin/firestore';
import { FinancialIndicatorRepositoryFirestore } from '@/features/financial-indicator/infra/persistence/financial-indicator.repository.firestore';
import { FindActiveFinancialIndicatorUseCase } from '@/features/financial-indicator/application/find-active-financial-indicator.usecase';

export interface FinancialIndicatorModuleDeps {
  db: Firestore;
}

export interface FinancialIndicatorModule {
  /** Contrato interno (sem rota HTTP nesta história) consumido pela wallet via porta. */
  internal: {
    findActive: FindActiveFinancialIndicatorUseCase;
  };
}

export function makeFinancialIndicatorModule(
  deps: FinancialIndicatorModuleDeps,
): FinancialIndicatorModule {
  const repository = FinancialIndicatorRepositoryFirestore.create(deps.db);
  return {
    internal: {
      findActive: FindActiveFinancialIndicatorUseCase.create(repository),
    },
  };
}
