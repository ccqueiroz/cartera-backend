import { EditCategoryUseCase } from './edit-category.usecase';
import { Category } from '../domain/category.entity';
import { CategoryDescriptionEnum } from '../domain/enums/category-description.enum';
import { CategoryGroupEnum } from '../domain/enums/category-group.enum';
import { TransactionTypeEnum } from '@/shared/kernel/enums/transaction-type.enum';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const makeActive = () =>
  Category.create({
    id: 'cat-1',
    description: 'Uber',
    descriptionEnum: CategoryDescriptionEnum.UBER,
    group: CategoryGroupEnum.MOBILITY_BY_APP,
    type: TransactionTypeEnum.BILLS,
    createdAt: '2026-06-01T10:00:00.000Z',
  });

const editInput = {
  descriptionEnum: CategoryDescriptionEnum.UBER,
  description: 'Uber Black',
  group: CategoryGroupEnum.MOBILITY_BY_APP,
  type: TransactionTypeEnum.BILLS,
};

describe('EditCategoryUseCase', () => {
  it('atualiza o ativo e seta updatedAt', async () => {
    const updated: Category[] = [];
    const repository = {
      findActiveByEnum: async () => makeActive(),
      update: async (c: Category) => void updated.push(c),
    } as any;
    const useCase = EditCategoryUseCase.create(
      repository,
      () => '2026-06-06T10:00:00.000Z',
    );

    const result = await useCase.execute(editInput);

    expect(result.toOutput().description).toBe('Uber Black');
    expect(result.toOutput().updatedAt).toBe('2026-06-06T10:00:00.000Z');
    expect(updated).toHaveLength(1);
  });

  it('lança not found quando não existe ativo (404)', async () => {
    const repository = {
      findActiveByEnum: async () => null,
      update: async () => {},
    } as any;
    const useCase = EditCategoryUseCase.create(
      repository,
      () => '2026-06-06T10:00:00.000Z',
    );

    await expect(useCase.execute(editInput)).rejects.toMatchObject({
      code: ErrorCode.CATEGORY_NOT_FOUND,
    });
  });

  it('rejeita troca de descriptionEnum (422)', async () => {
    const repository = {
      findActiveByEnum: async () => makeActive(),
      update: async () => {},
    } as any;
    const useCase = EditCategoryUseCase.create(
      repository,
      () => '2026-06-06T10:00:00.000Z',
    );

    await expect(
      useCase.execute({ ...editInput, requestedDescriptionEnum: 'LYFT' }),
    ).rejects.toMatchObject({
      code: ErrorCode.CATEGORY_DESCRIPTION_ENUM_IMMUTABLE,
    });
  });
});
