import { ListCategoriesByGroupUseCase } from './list-categories-by-group.usecase';
import { Category } from '../domain/category.entity';
import { CategoryDescriptionEnum } from '../domain/enums/category-description.enum';
import { CategoryGroupEnum } from '../domain/enums/category-group.enum';
import { CategoryType } from '../domain/enums/category-type.enum';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const makeCategory = () =>
  Category.create({
    id: 'cat-1',
    description: 'Empréstimos',
    descriptionEnum: CategoryDescriptionEnum.LOAN_REPAYMENT,
    group: CategoryGroupEnum.BANK,
    type: CategoryType.BILLS,
    createdAt: '2026-06-01T10:00:00.000Z',
  });

describe('ListCategoriesByGroupUseCase', () => {
  it('retorna ativos do grupo filtrados por tipo', async () => {
    const repository = {
      findActiveByGroupAndType: async () => [makeCategory()],
    } as any;
    const useCase = ListCategoriesByGroupUseCase.create(repository);

    const result = await useCase.execute({ group: 'BANK', type: 'BILLS' });

    expect(result).toHaveLength(1);
    expect(result[0].group).toBe(CategoryGroupEnum.BANK);
  });

  it('retorna [] quando não há ativos no grupo/tipo', async () => {
    const repository = { findActiveByGroupAndType: async () => [] } as any;
    const useCase = ListCategoriesByGroupUseCase.create(repository);

    expect(
      await useCase.execute({ group: 'BANK', type: 'RECEIVABLE' }),
    ).toEqual([]);
  });

  it('rejeita group fora do enum', async () => {
    const repository = { findActiveByGroupAndType: async () => [] } as any;
    const useCase = ListCategoriesByGroupUseCase.create(repository);

    await expect(
      useCase.execute({ group: 'NOPE', type: 'BILLS' }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_CATEGORY_GROUP });
  });

  it('rejeita type fora do enum', async () => {
    const repository = { findActiveByGroupAndType: async () => [] } as any;
    const useCase = ListCategoriesByGroupUseCase.create(repository);

    await expect(
      useCase.execute({ group: 'BANK', type: 'NOPE' }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_CATEGORY_TYPE });
  });
});
