import { ListCategoriesByTypeUseCase } from './list-categories-by-type.usecase';
import { Category } from '../domain/category.entity';
import { CategoryDescriptionEnum } from '../domain/enums/category-description.enum';
import { CategoryGroupEnum } from '../domain/enums/category-group.enum';
import { CategoryType } from '../domain/enums/category-type.enum';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const makeCategory = () =>
  Category.create({
    id: 'cat-1',
    description: 'Uber',
    descriptionEnum: CategoryDescriptionEnum.UBER,
    group: CategoryGroupEnum.MOBILITY_BY_APP,
    type: CategoryType.BILLS,
    createdAt: '2026-06-01T10:00:00.000Z',
  });

describe('ListCategoriesByTypeUseCase', () => {
  it('retorna os ativos do tipo como output', async () => {
    const repository = {
      findActiveByType: async () => [makeCategory()],
    } as any;
    const useCase = ListCategoriesByTypeUseCase.create(repository);

    const result = await useCase.execute({ type: 'BILLS' });

    expect(result).toHaveLength(1);
    expect(result[0].descriptionEnum).toBe(CategoryDescriptionEnum.UBER);
  });

  it('retorna [] quando não há ativos', async () => {
    const repository = { findActiveByType: async () => [] } as any;
    const useCase = ListCategoriesByTypeUseCase.create(repository);

    expect(await useCase.execute({ type: 'RECEIVABLE' })).toEqual([]);
  });

  it('rejeita type fora do enum', async () => {
    const repository = { findActiveByType: async () => [] } as any;
    const useCase = ListCategoriesByTypeUseCase.create(repository);

    await expect(useCase.execute({ type: 'NOPE' })).rejects.toMatchObject({
      code: ErrorCode.INVALID_CATEGORY_TYPE,
    });
  });
});
