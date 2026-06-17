import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { TransferController } from '@/features/transfer/infra/http/transfer.controller';
import { CreateTransferRoute } from '@/features/transfer/infra/http/create-transfer.route';
import { ListTransfersRoute } from '@/features/transfer/infra/http/list-transfers.route';
import { GetTransferByIdRoute } from '@/features/transfer/infra/http/get-transfer-by-id.route';

export function transferRoutes(
  controller: TransferController,
  authMiddleware: Middleware,
): Route[] {
  const authenticated = [authMiddleware];

  return [
    ListTransfersRoute.create(controller, authenticated),
    GetTransferByIdRoute.create(controller, authenticated),
    CreateTransferRoute.create(controller, authenticated),
  ];
}
