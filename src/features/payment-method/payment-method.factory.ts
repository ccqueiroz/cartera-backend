import { Firestore } from 'firebase-admin/firestore';
import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { crypto } from '@/packages/clients/crypto';
import { PaymentMethodRepositoryFirestore } from '@/features/payment-method/infra/persistence/payment-method.repository.firestore';
import { CreatePaymentMethodUseCase } from '@/features/payment-method/application/create-payment-method.usecase';
import { ListPaymentMethodsUseCase } from '@/features/payment-method/application/list-payment-methods.usecase';
import { GetPaymentMethodByEnumUseCase } from '@/features/payment-method/application/get-payment-method-by-enum.usecase';
import { UpdatePaymentMethodUseCase } from '@/features/payment-method/application/update-payment-method.usecase';
import { SoftDeletePaymentMethodUseCase } from '@/features/payment-method/application/soft-delete-payment-method.usecase';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';
import { paymentMethodRoutes } from '@/features/payment-method/infra/http/payment-method.routes';

export interface PaymentMethodModuleDeps {
  db: Firestore;
  // Slot plugável: vira o gate 403 na história de role; ausente = escrita livre.
  writeGuard?: Middleware;
  generateId?: () => string;
  now?: () => string;
}

export function makePaymentMethodModule(
  deps: PaymentMethodModuleDeps,
): Route[] {
  const generateId = deps.generateId ?? (() => crypto.randomUUID());
  const now = deps.now ?? (() => new Date().toISOString());

  const repository = PaymentMethodRepositoryFirestore.create(deps.db);

  const controller = PaymentMethodController.create({
    create: CreatePaymentMethodUseCase.create(repository, generateId, now),
    list: ListPaymentMethodsUseCase.create(repository),
    getByEnum: GetPaymentMethodByEnumUseCase.create(repository),
    update: UpdatePaymentMethodUseCase.create(repository, now),
    remove: SoftDeletePaymentMethodUseCase.create(repository, now),
  });

  return paymentMethodRoutes(controller, deps.writeGuard);
}
