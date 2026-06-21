import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { BillController } from '@/features/core-finance/bills/infra/http/bill.controller';
import { ReceivableController } from '@/features/core-finance/receivables/infra/http/receivable.controller';
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
import { CreateReceivableRoute } from '@/features/core-finance/infra/http/create-receivable.route';
import { CreateInstallmentReceivableRoute } from '@/features/core-finance/infra/http/create-installment-receivable.route';
import { ListReceivablesRoute } from '@/features/core-finance/infra/http/list-receivables.route';
import { ListUnreceivedReceivablesByPeriodRoute } from '@/features/core-finance/infra/http/list-unreceived-receivables-by-period.route';
import { GetReceivableByIdRoute } from '@/features/core-finance/infra/http/get-receivable-by-id.route';
import { SettleReceivableRoute } from '@/features/core-finance/infra/http/settle-receivable.route';
import { GlobalSettleReceivableRoute } from '@/features/core-finance/infra/http/global-settle-receivable.route';
import { EditReceivableRoute } from '@/features/core-finance/infra/http/edit-receivable.route';
import { DeleteReceivableRoute } from '@/features/core-finance/infra/http/delete-receivable.route';
import { ReverseReceivableRoute } from '@/features/core-finance/infra/http/reverse-receivable.route';

/** Rotas HTTP do condutor `bills`. */
export function billRoutes(
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

/** Rotas HTTP do condutor `receivables` (espelho de bills, direção receita). */
export function receivableRoutes(
  controller: ReceivableController,
  authMiddleware: Middleware,
): Route[] {
  const authenticated = [authMiddleware];
  return [
    ListReceivablesRoute.create(controller, authenticated),
    ListUnreceivedReceivablesByPeriodRoute.create(controller, authenticated),
    GetReceivableByIdRoute.create(controller, authenticated),
    CreateReceivableRoute.create(controller, authenticated),
    CreateInstallmentReceivableRoute.create(controller, authenticated),
    SettleReceivableRoute.create(controller, authenticated),
    GlobalSettleReceivableRoute.create(controller, authenticated),
    EditReceivableRoute.create(controller, authenticated),
    DeleteReceivableRoute.create(controller, authenticated),
    ReverseReceivableRoute.create(controller, authenticated),
  ];
}
