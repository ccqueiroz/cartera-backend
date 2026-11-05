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
      'GET category/list-all',
      'GET category/list-by-enum/:descriptionEnum',
      'GET category/list-groups',
      'GET category/list-by-groups/:group',
      'POST category/create',
      'PUT category/edit/:descriptionEnum',
      'DELETE category/delete/:descriptionEnum',
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
