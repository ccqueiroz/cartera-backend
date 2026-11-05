import { makeCategoryModule } from './category.factory';
import { GetCategoryByEnumUseCase } from './application/get-category-by-enum.usecase';
import { ListCategoriesByTypeUseCase } from './application/list-categories-by-type.usecase';
import { Middleware } from '@/shared/http/middleware';

const authMiddleware = { getHandler: jest.fn() } as unknown as Middleware;

describe('makeCategoryModule', () => {
  const module = makeCategoryModule({ db: {} as any, authMiddleware });

  it('exposes reads.getByEnum/.listByType as wired instances', () => {
    expect(module.reads.getByEnum).toBeInstanceOf(GetCategoryByEnumUseCase);
    expect(module.reads.listByType).toBeInstanceOf(ListCategoriesByTypeUseCase);
  });

  it('exposes non-empty routes, all authenticated', () => {
    expect(module.routes.length).toBeGreaterThan(0);
    expect(
      module.routes.every((route) =>
        (route.middlewares ?? []).includes(authMiddleware),
      ),
    ).toBe(true);
  });
});
