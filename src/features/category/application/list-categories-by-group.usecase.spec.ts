import { ListCategoriesByGroupUseCase } from './list-categories-by-group.usecase';
import { Category } from '@/features/category/domain/category.entity';
import { CategoryDescriptionEnum } from '@/features/category/domain/enums/category-description.enum';
import { CategoryGroupEnum } from '@/features/category/domain/enums/category-group.enum';
import { TransactionTypeEnum } from '@/shared/kernel/enums/transaction-type.enum';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const makeCategory = () =>
  Category.create({
    id: 'cat-1',
    description: 'Empréstimos',
    descriptionEnum: CategoryDescriptionEnum.LOAN_REPAYMENT,
    group: CategoryGroupEnum.BANK,
    type: TransactionTypeEnum.BILLS,
    createdAt: '2026-06-01T10:00:00.000Z',
  });

describe('ListCategoriesByGroupUseCase', () => {
  it('returns active items of the group filtered by type', async () => {
    const repository = {
      findActiveByGroupAndType: async () => [makeCategory()],
    } as any;
    const useCase = ListCategoriesByGroupUseCase.create(repository);

    const result = await useCase.execute({ group: 'BANK', type: 'BILLS' });

    expect(result).toHaveLength(1);
    expect(result[0].group).toBe(CategoryGroupEnum.BANK);
  });

  it('returns [] when no active items match the group/type', async () => {
    const repository = { findActiveByGroupAndType: async () => [] } as any;
    const useCase = ListCategoriesByGroupUseCase.create(repository);

    expect(
      await useCase.execute({ group: 'BANK', type: 'RECEIVABLES' }),
    ).toEqual([]);
  });

  it('rejects group outside the enum', async () => {
    const repository = { findActiveByGroupAndType: async () => [] } as any;
    const useCase = ListCategoriesByGroupUseCase.create(repository);

    await expect(
      useCase.execute({ group: 'NOPE', type: 'BILLS' }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_CATEGORY_GROUP });
  });

  it('rejects type outside the enum', async () => {
    const repository = { findActiveByGroupAndType: async () => [] } as any;
    const useCase = ListCategoriesByGroupUseCase.create(repository);

    await expect(
      useCase.execute({ group: 'BANK', type: 'NOPE' }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_CATEGORY_TYPE });
  });
});
