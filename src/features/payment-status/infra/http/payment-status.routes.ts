import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentStatusController } from '@/features/payment-status/infra/http/payment-status.controller';
import { ListPaymentStatusesRoute } from '@/features/payment-status/infra/http/list-payment-statuses.route';
import { GetPaymentStatusByEnumRoute } from '@/features/payment-status/infra/http/get-payment-status-by-enum.route';

export function paymentStatusRoutes(
  controller: PaymentStatusController,
  authMiddleware: Middleware,
): Route[] {
  const authenticated = [authMiddleware];

  return [
    ListPaymentStatusesRoute.create(controller, authenticated),
    GetPaymentStatusByEnumRoute.create(controller, authenticated),
  ];
}
