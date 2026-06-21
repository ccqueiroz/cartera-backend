import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';
import { CreateBillRoute } from '@/features/core-finance/infra/http/create-bill.route';
import { CreateInstallmentBillRoute } from '@/features/core-finance/infra/http/create-installment-bill.route';
import { ListBillsRoute } from '@/features/core-finance/infra/http/list-bills.route';
import { ListUnpaidBillsByPeriodRoute } from '@/features/core-finance/infra/http/list-unpaid-bills-by-period.route';
import { GetBillByIdRoute } from '@/features/core-finance/infra/http/get-bill-by-id.route';
import { SettleBillRoute } from '@/features/core-finance/infra/http/settle-bill.route';
import { GlobalSettleBillRoute } from '@/features/core-finance/infra/http/global-settle-bill.route';
import { EditBillRoute } from '@/features/core-finance/infra/http/edit-bill.route';
import { DeleteBillRoute } from '@/features/core-finance/infra/http/delete-bill.route';
import { ReverseBillRoute } from '@/features/core-finance/infra/http/reverse-bill.route';

/**
 * Agregador de rotas HTTP do contexto core-finance. Hoje só o condutor `bills`
 * expõe HTTP (o motor é interno); `receivables` entra aqui no futuro.
 */
export function coreFinanceRoutes(
  controller: BillController,
  authMiddleware: Middleware,
): Route[] {
  const authenticated = [authMiddleware];
  return [
    ListBillsRoute.create(controller, authenticated),
    ListUnpaidBillsByPeriodRoute.create(controller, authenticated),
    GetBillByIdRoute.create(controller, authenticated),
    CreateBillRoute.create(controller, authenticated),
    CreateInstallmentBillRoute.create(controller, authenticated),
    SettleBillRoute.create(controller, authenticated),
    GlobalSettleBillRoute.create(controller, authenticated),
    EditBillRoute.create(controller, authenticated),
    DeleteBillRoute.create(controller, authenticated),
    ReverseBillRoute.create(controller, authenticated),
  ];
}
