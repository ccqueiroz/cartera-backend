import { DeleteCategoryUseCase } from './delete-category.usecase';
import { Category } from '../domain/category.entity';
import { CategoryDescriptionEnum } from '../domain/enums/category-description.enum';
import { CategoryGroupEnum } from '../domain/enums/category-group.enum';
import { CategoryType } from '../domain/enums/category-type.enum';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const makeActive = () =>
  Category.create({
    id: 'cat-1',
    description: 'Uber',
    descriptionEnum: CategoryDescriptionEnum.UBER,
    group: CategoryGroupEnum.MOBILITY_BY_APP,
    type: CategoryType.BILLS,
    createdAt: '2026-06-01T10:00:00.000Z',
  });

describe('DeleteCategoryUseCase', () => {
  it('soft-deleta o ativo (deletedAt e updatedAt = now)', async () => {
    const removed: Category[] = [];
    const repository = {
      findActiveByEnum: async () => makeActive(),
      softDelete: async (c: Category) => void removed.push(c),
    } as any;
    const useCase = DeleteCategoryUseCase.create(
      repository,
      () => '2026-06-07T10:00:00.000Z',
    );

    await useCase.execute({ descriptionEnum: CategoryDescriptionEnum.UBER });

    expect(removed).toHaveLength(1);
    expect(removed[0].isActive).toBe(false);
    expect(removed[0].toPersistence().deletedAt).toBe(
      '2026-06-07T10:00:00.000Z',
    );
  });

  it('lança not found quando não há ativo (404)', async () => {
    const repository = {
      findActiveByEnum: async () => null,
      softDelete: async () => {},
    } as any;
    const useCase = DeleteCategoryUseCase.create(
      repository,
      () => '2026-06-07T10:00:00.000Z',
    );

    await expect(
      useCase.execute({ descriptionEnum: CategoryDescriptionEnum.UBER }),
    ).rejects.toMatchObject({ code: ErrorCode.CATEGORY_NOT_FOUND });
  });
});
