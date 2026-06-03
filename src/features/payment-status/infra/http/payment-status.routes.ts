import { Route } from '@/shared/http/route';
import { PaymentStatusController } from '@/features/payment-status/infra/http/payment-status.controller';
import { ListPaymentStatusesRoute } from '@/features/payment-status/infra/http/list-payment-statuses.route';
import { GetPaymentStatusByEnumRoute } from '@/features/payment-status/infra/http/get-payment-status-by-enum.route';

export function paymentStatusRoutes(
  controller: PaymentStatusController,
): Route[] {
  return [
    ListPaymentStatusesRoute.create(controller),
    GetPaymentStatusByEnumRoute.create(controller),
  ];
}
