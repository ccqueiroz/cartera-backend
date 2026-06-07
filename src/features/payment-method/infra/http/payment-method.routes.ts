import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';
import { CreatePaymentMethodRoute } from '@/features/payment-method/infra/http/create-payment-method.route';
import { ListPaymentMethodsRoute } from '@/features/payment-method/infra/http/list-payment-methods.route';
import { GetPaymentMethodByEnumRoute } from '@/features/payment-method/infra/http/get-payment-method-by-enum.route';
import { UpdatePaymentMethodRoute } from '@/features/payment-method/infra/http/update-payment-method.route';
import { DeletePaymentMethodRoute } from '@/features/payment-method/infra/http/delete-payment-method.route';

export function paymentMethodRoutes(
  controller: PaymentMethodController,
  authMiddleware: Middleware,
): Route[] {
  const authenticated = [authMiddleware];

  return [
    ListPaymentMethodsRoute.create(controller, authenticated),
    GetPaymentMethodByEnumRoute.create(controller, authenticated),
    CreatePaymentMethodRoute.create(controller, authenticated),
    UpdatePaymentMethodRoute.create(controller, authenticated),
    DeletePaymentMethodRoute.create(controller, authenticated),
  ];
}
