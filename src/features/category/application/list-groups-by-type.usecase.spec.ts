import { ListGroupsByTypeUseCase } from './list-groups-by-type.usecase';
import { CategoryGroupEnum } from '../domain/enums/category-group.enum';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

describe('ListGroupsByTypeUseCase', () => {
  it('retorna os grupos distintos do tipo', async () => {
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

  it('retorna [] quando nenhum grupo tem ativo do tipo', async () => {
    const repository = { listGroupsByType: async () => [] } as any;
    const useCase = ListGroupsByTypeUseCase.create(repository);

    expect(await useCase.execute({ type: 'RECEIVABLES' })).toEqual([]);
  });

  it('rejeita type fora do enum', async () => {
    const repository = { listGroupsByType: async () => [] } as any;
    const useCase = ListGroupsByTypeUseCase.create(repository);

    await expect(useCase.execute({ type: 'NOPE' })).rejects.toMatchObject({
      code: ErrorCode.INVALID_CATEGORY_TYPE,
    });
  });
});
