import { CreateCategoryUseCase } from './create-category.usecase';
import { Category } from '../domain/category.entity';
import { CategoryDescriptionEnum } from '../domain/enums/category-description.enum';
import { CategoryGroupEnum } from '../domain/enums/category-group.enum';
import { TransactionTypeEnum } from '@/shared/kernel/enums/transaction-type.enum';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const payload = {
  description: 'Uber',
  descriptionEnum: CategoryDescriptionEnum.UBER,
  group: CategoryGroupEnum.MOBILITY_BY_APP,
  type: TransactionTypeEnum.BILLS,
};

const makeSoftDeleted = () => {
  const category = Category.with({
    id: 'cat-1',
    description: 'Uber',
    descriptionEnum: CategoryDescriptionEnum.UBER,
    group: CategoryGroupEnum.MOBILITY_BY_APP,
    type: TransactionTypeEnum.BILLS,
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: null,
    deletedAt: '2026-06-02T10:00:00.000Z',
  });
  return category;
};

describe('CreateCategoryUseCase', () => {
  it('cria nova categoria quando o enum não existe', async () => {
    const created: Category[] = [];
    const repository = {
      findByEnum: async () => null,
      create: async (c: Category) => void created.push(c),
      update: async () => {},
    } as any;
    const useCase = CreateCategoryUseCase.create(
      repository,
      () => 'uuid-1',
      () => '2026-06-05T10:00:00.000Z',
    );

    const result = await useCase.execute(payload);

    expect(result.reactivated).toBe(false);
    expect(created).toHaveLength(1);
    expect(result.category.toPersistence().createdAt).toBe(
      '2026-06-05T10:00:00.000Z',
    );
    expect(result.category.toPersistence().id).toBe('uuid-1');
  });

  it('conflita (409) quando o enum já está ativo', async () => {
    const repository = {
      findByEnum: async () =>
        Category.create({
          id: 'cat-1',
          ...payload,
          createdAt: '2026-06-01T10:00:00.000Z',
        }),
      create: async () => {},
      update: async () => {},
    } as any;
    const useCase = CreateCategoryUseCase.create(
      repository,
      () => 'uuid-1',
      () => '2026-06-05T10:00:00.000Z',
    );

    await expect(useCase.execute(payload)).rejects.toMatchObject({
      code: ErrorCode.CATEGORY_ALREADY_EXISTS,
    });
  });

  it('reativa (200) quando o enum existe soft-deleted', async () => {
    const updated: Category[] = [];
    const repository = {
      findByEnum: async () => makeSoftDeleted(),
      create: async () => {},
      update: async (c: Category) => void updated.push(c),
    } as any;
    const useCase = CreateCategoryUseCase.create(
      repository,
      () => 'uuid-1',
      () => '2026-06-05T10:00:00.000Z',
    );

    const result = await useCase.execute(payload);

    expect(result.reactivated).toBe(true);
    expect(result.category.isActive).toBe(true);
    expect(result.category.toPersistence().updatedAt).toBe(
      '2026-06-05T10:00:00.000Z',
    );
    expect(updated).toHaveLength(1);
  });
});
