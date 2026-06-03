import { Category } from './category.entity';
import { CategoryDescriptionEnum } from './enums/category-description.enum';
import { CategoryGroupEnum } from './enums/category-group.enum';
import { TransactionTypeEnum } from '@/shared/kernel/enums/transaction-type.enum';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const baseInput = {
  id: 'cat-1',
  description: 'Uber',
  descriptionEnum: CategoryDescriptionEnum.UBER,
  group: CategoryGroupEnum.MOBILITY_BY_APP,
  type: TransactionTypeEnum.BILLS,
  createdAt: '2026-06-01T10:00:00.000Z',
};

describe('Category entity', () => {
  it('nasce ativo com updatedAt/deletedAt nulos', () => {
    const category = Category.create(baseInput);
    const output = category.toOutput();
    expect(output.active).toBe(true);
    expect(output.updatedAt).toBeNull();
    expect(category.toPersistence().deletedAt).toBeNull();
  });

  it('rejeita description vazio', () => {
    expect(() => Category.create({ ...baseInput, description: '   ' })).toThrow(
      ErrorCode.CATEGORY_DESCRIPTION_REQUIRED,
    );
  });

  it('edit não troca o descriptionEnum imutável e seta updatedAt', () => {
    const category = Category.create(baseInput);
    category.edit({
      description: 'Uber Black',
      group: CategoryGroupEnum.MOBILITY_BY_APP,
      type: TransactionTypeEnum.BILLS,
      updatedAt: '2026-06-02T10:00:00.000Z',
    });
    expect(category.descriptionEnum).toBe(CategoryDescriptionEnum.UBER);
    expect(category.toOutput().updatedAt).toBe('2026-06-02T10:00:00.000Z');
  });

  it('softDelete marca deletedAt e updatedAt; active deriva', () => {
    const category = Category.create(baseInput);
    category.softDelete('2026-06-03T10:00:00.000Z');
    expect(category.isActive).toBe(false);
    expect(category.toPersistence().deletedAt).toBe('2026-06-03T10:00:00.000Z');
  });

  it('reactivate limpa deletedAt', () => {
    const category = Category.with({
      ...baseInput,
      updatedAt: null,
      deletedAt: '2026-06-03T10:00:00.000Z',
    });
    category.reactivate('2026-06-04T10:00:00.000Z');
    expect(category.isActive).toBe(true);
    expect(category.toOutput().updatedAt).toBe('2026-06-04T10:00:00.000Z');
  });
});
