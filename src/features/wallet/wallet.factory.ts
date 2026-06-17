import { Firestore } from 'firebase-admin/firestore';
import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { crypto } from '@/packages/clients/crypto';
import { FinancialIndicatorGateway } from '@/features/wallet/domain/ports/financial-indicator.gateway.port';
import { WalletRepositoryFirestore } from '@/features/wallet/infra/persistence/wallet.repository.firestore';
import { CreateWalletUseCase } from '@/features/wallet/application/create-wallet.usecase';
import { ListWalletsUseCase } from '@/features/wallet/application/list-wallets.usecase';
import { GetWalletByIdUseCase } from '@/features/wallet/application/get-wallet-by-id.usecase';
import { EditWalletUseCase } from '@/features/wallet/application/edit-wallet.usecase';
import { DeleteWalletUseCase } from '@/features/wallet/application/delete-wallet.usecase';
import { AdjustBalanceUseCase } from '@/features/wallet/application/adjust-balance.usecase';
import { GetWalletStatementUseCase } from '@/features/wallet/application/get-wallet-statement.usecase';
import { CreateWalletInternalUseCase } from '@/features/wallet/application/create-wallet-internal.usecase';
import { WalletController } from '@/features/wallet/infra/http/wallet.controller';
import { walletRoutes } from '@/features/wallet/infra/http/wallet.routes';

export interface WalletModuleDeps {
  db: Firestore;
  authMiddleware: Middleware;
  financialIndicatorGateway: FinancialIndicatorGateway;
  generateId?: () => string;
  now?: () => string;
}

export interface WalletModule {
  routes: Route[];
  /** Contrato interno (UC8) para o auth semear a wallet "Cartera" via porta — sem rota HTTP. */
  internal: {
    createWallet: CreateWalletInternalUseCase;
  };
}

export function makeWalletModule(deps: WalletModuleDeps): WalletModule {
  const generateId = deps.generateId ?? (() => crypto.randomUUID());
  const now = deps.now ?? (() => new Date().toISOString());

  const repository = WalletRepositoryFirestore.create(deps.db);
  const gateway = deps.financialIndicatorGateway;

  const controller = WalletController.create({
    create: CreateWalletUseCase.create(repository, generateId, now),
    list: ListWalletsUseCase.create(repository, gateway, now),
    getById: GetWalletByIdUseCase.create(repository, gateway, now),
    edit: EditWalletUseCase.create(repository, now),
    remove: DeleteWalletUseCase.create(repository, now),
    adjust: AdjustBalanceUseCase.create(repository, gateway, generateId, now),
    statement: GetWalletStatementUseCase.create(repository),
  });

  return {
    routes: walletRoutes(controller, deps.authMiddleware),
    internal: {
      createWallet: CreateWalletInternalUseCase.create(
        repository,
        generateId,
        now,
      ),
    },
  };
}
