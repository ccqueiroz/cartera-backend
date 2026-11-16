import { categoryRoutes } from '@/features/category/infra/http/category.routes';
import { CategoryController } from '@/features/category/infra/http/category.controller';
import { Middleware } from '@/shared/http/middleware';

const controller = CategoryController.create({} as any);
const authMiddleware = { getHandler: jest.fn() } as unknown as Middleware;

describe('categoryRoutes', () => {
  it('registers the seven CRUD routes with correct method and path', () => {
    const routes = categoryRoutes(controller, authMiddleware);

    expect(
      routes.map((route) => `${route.method.toUpperCase()} ${route.path}`),
    ).toEqual([
      'GET category',
      'GET category/group',
      'GET category/:description_enum',
      'GET category/group/:group',
      'POST category',
      'PUT category/:description_enum',
      'DELETE category/:description_enum',
    ]);
  });

  it('all routes go through the authentication middleware, reads included', () => {
    const routes = categoryRoutes(controller, authMiddleware);

    expect(
      routes.every((route) =>
        (route.middlewares ?? []).includes(authMiddleware),
      ),
    ).toBe(true);
  });
});
