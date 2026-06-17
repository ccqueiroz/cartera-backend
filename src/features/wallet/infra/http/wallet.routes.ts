import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { WalletController } from '@/features/wallet/infra/http/wallet.controller';
import { CreateWalletRoute } from '@/features/wallet/infra/http/create-wallet.route';
import { ListWalletsRoute } from '@/features/wallet/infra/http/list-wallets.route';
import { GetWalletByIdRoute } from '@/features/wallet/infra/http/get-wallet-by-id.route';
import { WalletStatementRoute } from '@/features/wallet/infra/http/wallet-statement.route';
import { EditWalletRoute } from '@/features/wallet/infra/http/edit-wallet.route';
import { AdjustBalanceRoute } from '@/features/wallet/infra/http/adjust-balance.route';
import { DeleteWalletRoute } from '@/features/wallet/infra/http/delete-wallet.route';

export function walletRoutes(
  controller: WalletController,
  authMiddleware: Middleware,
): Route[] {
  const authenticated = [authMiddleware];

  return [
    ListWalletsRoute.create(controller, authenticated),
    GetWalletByIdRoute.create(controller, authenticated),
    WalletStatementRoute.create(controller, authenticated),
    CreateWalletRoute.create(controller, authenticated),
    EditWalletRoute.create(controller, authenticated),
    AdjustBalanceRoute.create(controller, authenticated),
    DeleteWalletRoute.create(controller, authenticated),
  ];
}
