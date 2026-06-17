import { Firestore } from 'firebase-admin/firestore';
import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { crypto } from '@/packages/clients/crypto';
import { WalletGateway } from '@/features/transfer/domain/ports/wallet.gateway.port';
import { PaymentMethodGateway } from '@/features/transfer/domain/ports/payment-method.gateway.port';
import { TransferRepositoryFirestore } from '@/features/transfer/infra/persistence/transfer.repository.firestore';
import { CreateTransferUseCase } from '@/features/transfer/application/create-transfer.usecase';
import { ListTransfersUseCase } from '@/features/transfer/application/list-transfers.usecase';
import { GetTransferByIdUseCase } from '@/features/transfer/application/get-transfer-by-id.usecase';
import { TransferController } from '@/features/transfer/infra/http/transfer.controller';
import { transferRoutes } from '@/features/transfer/infra/http/transfer.routes';

export interface TransferModuleDeps {
  db: Firestore;
  authMiddleware: Middleware;
  walletGateway: WalletGateway;
  paymentMethodGateway: PaymentMethodGateway;
  generateId?: () => string;
  now?: () => string;
}

export function makeTransferModule(deps: TransferModuleDeps): Route[] {
  const generateId = deps.generateId ?? (() => crypto.randomUUID());
  const now = deps.now ?? (() => new Date().toISOString());

  const repository = TransferRepositoryFirestore.create(deps.db);

  const controller = TransferController.create({
    create: CreateTransferUseCase.create(
      repository,
      deps.walletGateway,
      deps.paymentMethodGateway,
      generateId,
      now,
    ),
    list: ListTransfersUseCase.create(repository),
    getById: GetTransferByIdUseCase.create(repository),
  });

  return transferRoutes(controller, deps.authMiddleware);
}
