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
      'GET payment-method/:descriptionEnum',
      'POST payment-method/create',
      'PUT payment-method/:id',
      'DELETE payment-method/:id',
    ]);
  });

  it('applies the write guard only to create, update and delete', () => {
    const routes = paymentMethodRoutes(controller, writeGuard);
    const guardedByPath = Object.fromEntries(
      routes.map((route) => [
        route.path,
        (route.middlewares ?? []).includes(writeGuard),
      ]),
    );

    expect(guardedByPath).toEqual({
      'payment-method': false,
      'payment-method/:descriptionEnum': false,
      'payment-method/create': true,
      'payment-method/:id': true,
    });
  });

  it('leaves every route unguarded when no write guard is provided', () => {
    const routes = paymentMethodRoutes(controller);

    expect(
      routes.every((route) => (route.middlewares ?? []).length === 0),
    ).toBe(true);
  });
});
