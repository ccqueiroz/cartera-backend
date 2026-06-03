import { paymentStatusRoutes } from '@/features/payment-status/infra/http/payment-status.routes';
import { PaymentStatusController } from '@/features/payment-status/infra/http/payment-status.controller';

const controller = PaymentStatusController.create({} as any);

describe('paymentStatusRoutes', () => {
  it('registers the two read routes with fixed segments', () => {
    const routes = paymentStatusRoutes(controller);

    expect(
      routes.map((route) => `${route.method.toUpperCase()} ${route.path}`),
    ).toEqual([
      'GET payment-status',
      'GET payment-status/description/:descriptionEnum',
    ]);
  });

  it('leaves the read routes unguarded', () => {
    const routes = paymentStatusRoutes(controller);

    expect(
      routes.every((route) => (route.middlewares ?? []).length === 0),
    ).toBe(true);
  });
});
