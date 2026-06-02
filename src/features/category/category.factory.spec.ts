import { makeCategoryModule } from './category.factory';
import { GetCategoryByEnumUseCase } from './application/get-category-by-enum.usecase';
import { ListCategoriesByTypeUseCase } from './application/list-categories-by-type.usecase';

describe('makeCategoryModule', () => {
  const module = makeCategoryModule({ db: {} as any });

  it('expõe reads.getByEnum/.listByType como instâncias wired', () => {
    expect(module.reads.getByEnum).toBeInstanceOf(GetCategoryByEnumUseCase);
    expect(module.reads.listByType).toBeInstanceOf(ListCategoriesByTypeUseCase);
  });

  it('expõe rotas não vazias', () => {
    expect(module.routes.length).toBeGreaterThan(0);
  });
});
