import { authRoutes } from '@/features/auth/infra/http/auth.routes';
import { AuthController } from '@/features/auth/infra/http/auth.controller';
import { Middleware } from '@/shared/http/middleware';

const controller = AuthController.create({} as any);
const authMiddleware = { getHandler: jest.fn() } as unknown as Middleware;

describe('authRoutes', () => {
  it('registra as cinco rotas com método e path corretos (sessão como recurso)', () => {
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

  it('só o signout é protegido pelo middleware de autenticação', () => {
    const routes = authRoutes(controller, authMiddleware);
    const guarded = routes.filter((route) =>
      (route.middlewares ?? []).includes(authMiddleware),
    );

    expect(
      guarded.map((route) => `${route.method.toUpperCase()} ${route.path}`),
    ).toEqual(['DELETE auth/session']);
  });
});
