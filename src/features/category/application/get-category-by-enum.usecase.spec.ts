import { GetCategoryByEnumUseCase } from './get-category-by-enum.usecase';
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

describe('GetCategoryByEnumUseCase', () => {
  it('retorna o ativo encontrado', async () => {
    const repository = {
      findActiveByEnum: async () => makeCategory(),
    } as any;
    const useCase = GetCategoryByEnumUseCase.create(repository);

    const result = await useCase.execute({ descriptionEnum: 'UBER' });

    expect(result.descriptionEnum).toBe(CategoryDescriptionEnum.UBER);
  });

  it('rejeita descriptionEnum fora do enum (400)', async () => {
    const repository = { findActiveByEnum: async () => null } as any;
    const useCase = GetCategoryByEnumUseCase.create(repository);

    await expect(
      useCase.execute({ descriptionEnum: 'NOPE' }),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_CATEGORY_DESCRIPTION_ENUM,
    });
  });

  it('lança not found quando não há doc ativo (404)', async () => {
    const repository = { findActiveByEnum: async () => null } as any;
    const useCase = GetCategoryByEnumUseCase.create(repository);

    await expect(
      useCase.execute({ descriptionEnum: 'UBER' }),
    ).rejects.toMatchObject({ code: ErrorCode.CATEGORY_NOT_FOUND });
  });
});
