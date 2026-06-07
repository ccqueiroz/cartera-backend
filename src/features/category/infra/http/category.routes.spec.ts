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
      'GET category',
      'GET category/description/:descriptionEnum',
      'GET category/group',
      'GET category/group/:group',
      'POST category',
      'PUT category/:descriptionEnum',
      'DELETE category/:descriptionEnum',
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
