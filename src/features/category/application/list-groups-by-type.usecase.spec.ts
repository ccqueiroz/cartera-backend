import { ListGroupsByTypeUseCase } from './list-groups-by-type.usecase';
import { CategoryGroupEnum } from '../domain/enums/category-group.enum';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

describe('ListGroupsByTypeUseCase', () => {
  it('returns the distinct groups of the type', async () => {
    const repository = {
      listGroupsByType: async () => [
        CategoryGroupEnum.MOBILITY_BY_APP,
        CategoryGroupEnum.FOOD,
      ],
    } as any;
    const useCase = ListGroupsByTypeUseCase.create(repository);

    const result = await useCase.execute({ type: 'BILLS' });

    expect(result).toEqual([
      CategoryGroupEnum.MOBILITY_BY_APP,
      CategoryGroupEnum.FOOD,
    ]);
  });

  it('returns [] when no group has an active item of the type', async () => {
    const repository = { listGroupsByType: async () => [] } as any;
    const useCase = ListGroupsByTypeUseCase.create(repository);

    expect(await useCase.execute({ type: 'RECEIVABLES' })).toEqual([]);
  });

  it('rejects type outside the enum', async () => {
    const repository = { listGroupsByType: async () => [] } as any;
    const useCase = ListGroupsByTypeUseCase.create(repository);

    await expect(useCase.execute({ type: 'NOPE' })).rejects.toMatchObject({
      code: ErrorCode.INVALID_CATEGORY_TYPE,
    });
  });
});
