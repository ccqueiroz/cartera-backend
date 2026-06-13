import { paymentStatusRoutes } from '@/features/payment-status/infra/http/payment-status.routes';
import { PaymentStatusController } from '@/features/payment-status/infra/http/payment-status.controller';
import { Middleware } from '@/shared/http/middleware';

const controller = PaymentStatusController.create({} as any);
const authMiddleware = { getHandler: jest.fn() } as unknown as Middleware;

describe('paymentStatusRoutes', () => {
  it('registers the two read routes with fixed segments', () => {
    const routes = paymentStatusRoutes(controller, authMiddleware);

    expect(
      routes.map((route) => `${route.method.toUpperCase()} ${route.path}`),
    ).toEqual([
      'GET payment-status/list-all',
      'GET payment-status/list-by-enum/:descriptionEnum',
    ]);
  });

  it('applies the auth middleware to both read routes', () => {
    const routes = paymentStatusRoutes(controller, authMiddleware);

    expect(
      routes.every((route) =>
        (route.middlewares ?? []).includes(authMiddleware),
      ),
    ).toBe(true);
  });
});
