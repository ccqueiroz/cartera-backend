import { paymentMethodRoutes } from '@/features/payment-method/infra/http/payment-method.routes';
import { PaymentMethodController } from '@/features/payment-method/infra/http/payment-method.controller';
import { Middleware } from '@/shared/http/middleware';

const controller = PaymentMethodController.create({} as any);
const writeGuard = { getHandler: jest.fn() } as unknown as Middleware;

describe('paymentMethodRoutes', () => {
  it('registers the five CRUD routes with correct methods and paths', () => {
    const routes = paymentMethodRoutes(controller);

    expect(
      routes.map((route) => `${route.method.toUpperCase()} ${route.path}`),
    ).toEqual([
      'GET payment-method',
      'GET payment-method/description/:descriptionEnum',
      'POST payment-method',
      'PUT payment-method/:descriptionEnum',
      'DELETE payment-method/:descriptionEnum',
    ]);
  });

  it('applies the write guard only to create, update and delete', () => {
    const routes = paymentMethodRoutes(controller, writeGuard);
    const guardedByRoute = Object.fromEntries(
      routes.map((route) => [
        `${route.method.toUpperCase()} ${route.path}`,
        (route.middlewares ?? []).includes(writeGuard),
      ]),
    );

    expect(guardedByRoute).toEqual({
      'GET payment-method': false,
      'GET payment-method/description/:descriptionEnum': false,
      'POST payment-method': true,
      'PUT payment-method/:descriptionEnum': true,
      'DELETE payment-method/:descriptionEnum': true,
    });
  });

  it('leaves every route unguarded when no write guard is provided', () => {
    const routes = paymentMethodRoutes(controller);

    expect(
      routes.every((route) => (route.middlewares ?? []).length === 0),
    ).toBe(true);
  });
});
