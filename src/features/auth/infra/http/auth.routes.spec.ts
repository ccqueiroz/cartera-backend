import { authRoutes } from '@/features/auth/infra/http/auth.routes';
import { AuthController } from '@/features/auth/infra/http/auth.controller';
import { Middleware } from '@/shared/http/middleware';

const controller = AuthController.create({} as any);
const authMiddleware = { getHandler: jest.fn() } as unknown as Middleware;

describe('authRoutes', () => {
  it('registers the five routes with correct method and path (session as resource)', () => {
    const routes = authRoutes(controller, authMiddleware);

    expect(
      routes.map((route) => `${route.method.toUpperCase()} ${route.path}`),
    ).toEqual([
      'POST auth/account',
      'POST auth/session',
      'PUT auth/session',
      'DELETE auth/session',
      'POST auth/password-recovery',
    ]);
  });

  it('only signout is protected by the authentication middleware', () => {
    const routes = authRoutes(controller, authMiddleware);
    const guarded = routes.filter((route) =>
      (route.middlewares ?? []).includes(authMiddleware),
    );

    expect(
      guarded.map((route) => `${route.method.toUpperCase()} ${route.path}`),
    ).toEqual(['DELETE auth/session']);
  });
});
