import { makeAuthModule } from '@/features/auth/auth.factory';
import { Middleware } from '@/shared/http/middleware';

const authMiddleware = { getHandler: jest.fn() } as unknown as Middleware;

describe('makeAuthModule', () => {
  it('monta o slice inteiro e devolve as cinco rotas', () => {
    const routes = makeAuthModule({
      authMiddleware,
      authProviderGateway: {} as any,
      personGateway: {} as any,
    });

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

  it('injeta o guard só na rota protegida via deps (nunca global)', () => {
    const routes = makeAuthModule({
      authMiddleware,
      authProviderGateway: {} as any,
      personGateway: {} as any,
    });
    const guarded = routes.filter((route) =>
      (route.middlewares ?? []).includes(authMiddleware),
    );

    expect(guarded.map((route) => route.method)).toEqual(['delete']);
  });
});
