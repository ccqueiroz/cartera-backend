import { personRoutes } from '@/features/person/infra/http/person.routes';
import { PersonController } from '@/features/person/infra/http/person.controller';
import { Middleware } from '@/shared/http/middleware';

const controller = PersonController.create({} as any);
const authMiddleware = { getHandler: jest.fn() } as unknown as Middleware;

describe('personRoutes', () => {
  it('registers the five self-service routes with the correct method and path', () => {
    const routes = personRoutes(controller, authMiddleware);

    expect(
      routes.map((route) => `${route.method.toUpperCase()} ${route.path}`),
    ).toEqual([
      'GET person/me',
      'PATCH person/me',
      'DELETE person/me',
      'PUT person/me/avatar',
      'DELETE person/me/avatar',
    ]);
  });

  it('all routes go through the authentication middleware', () => {
    const routes = personRoutes(controller, authMiddleware);
    expect(
      routes.every((route) =>
        (route.middlewares ?? []).includes(authMiddleware),
      ),
    ).toBe(true);
  });

  it('only the avatar upload route enlarges the body parser', () => {
    const routes = personRoutes(controller, authMiddleware);
    const limitByRoute = Object.fromEntries(
      routes.map((route) => [
        `${route.method.toUpperCase()} ${route.path}`,
        route.bodyLimit ?? null,
      ]),
    );

    expect(limitByRoute).toEqual({
      'GET person/me': null,
      'PATCH person/me': null,
      'DELETE person/me': null,
      'PUT person/me/avatar': '8mb',
      'DELETE person/me/avatar': null,
    });
  });

  it('exposes no public creation or lookup-by-email endpoint', () => {
    const routes = personRoutes(controller, authMiddleware);
    expect(routes.some((route) => route.method === 'post')).toBe(false);
    expect(routes.every((route) => route.path.startsWith('person/me'))).toBe(
      true,
    );
  });
});
