import { Firestore } from 'firebase-admin/firestore';
import { Route } from '@/shared/http/route';
import { PaymentStatusRepositoryFirestore } from '@/features/payment-status/infra/persistence/payment-status.repository.firestore';
import { ListPaymentStatusesUseCase } from '@/features/payment-status/application/list-payment-statuses.usecase';
import { GetPaymentStatusByEnumUseCase } from '@/features/payment-status/application/get-payment-status-by-enum.usecase';
import { PaymentStatusController } from '@/features/payment-status/infra/http/payment-status.controller';
import { paymentStatusRoutes } from '@/features/payment-status/infra/http/payment-status.routes';

export interface PaymentStatusModuleDeps {
  db: Firestore;
}

export function makePaymentStatusModule(
  deps: PaymentStatusModuleDeps,
): Route[] {
  const repository = PaymentStatusRepositoryFirestore.create(deps.db);

  const controller = PaymentStatusController.create({
    list: ListPaymentStatusesUseCase.create(repository),
    getByEnum: GetPaymentStatusByEnumUseCase.create(repository),
  });

  return paymentStatusRoutes(controller);
}
