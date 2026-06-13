import { categoryRoutes } from '@/features/category/infra/http/category.routes';
import { CategoryController } from '@/features/category/infra/http/category.controller';
import { Middleware } from '@/shared/http/middleware';

const controller = CategoryController.create({} as any);
const authMiddleware = { getHandler: jest.fn() } as unknown as Middleware;

describe('categoryRoutes', () => {
  it('registra as sete rotas CRUD com método e path corretos', () => {
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

  it('todas as rotas passam pelo middleware de autenticação, leituras incluídas', () => {
    const routes = categoryRoutes(controller, authMiddleware);

    expect(
      routes.every((route) =>
        (route.middlewares ?? []).includes(authMiddleware),
      ),
    ).toBe(true);
  });
});
