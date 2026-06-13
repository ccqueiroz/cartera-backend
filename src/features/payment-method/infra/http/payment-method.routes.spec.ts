import { paymentMethodRoutes } from '@/features/payment-method/infra/http/payment-method.routes';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';
import { Middleware } from '@/shared/http/middleware';

const controller = PaymentMethodController.create({} as any);
const authMiddleware = { getHandler: jest.fn() } as unknown as Middleware;

describe('paymentMethodRoutes', () => {
  it('registers the five CRUD routes with correct methods and paths', () => {
    const routes = paymentMethodRoutes(controller, authMiddleware);

    expect(
      routes.map((route) => `${route.method.toUpperCase()} ${route.path}`),
    ).toEqual([
      'GET payment-method/list-all',
      'GET payment-method/list-by-enum/:descriptionEnum',
      'POST payment-method/create',
      'PUT payment-method/edit/:descriptionEnum',
      'DELETE payment-method/delete/:descriptionEnum',
    ]);
  });

  it('applies the auth middleware to every route, reads included', () => {
    const routes = paymentMethodRoutes(controller, authMiddleware);

    expect(
      routes.every((route) =>
        (route.middlewares ?? []).includes(authMiddleware),
      ),
    ).toBe(true);
  });
});
