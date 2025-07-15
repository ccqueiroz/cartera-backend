import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';
import { GetCategoriesUseCase } from './get-categories.usecase';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';

let categoryServiceGatewayMock: jest.Mocked<CategoryServiceGateway>;

describe('Get Categories', () => {
  let getCategoriesUseCase: GetCategoriesUseCase;

  beforeEach(() => {
    categoryServiceGatewayMock = {
      getCategories: jest.fn(),
    } as any;

    getCategoriesUseCase = GetCategoriesUseCase.create({
      categoryService: categoryServiceGatewayMock,
    });
  });

  it('should be create a instance of the GetCategoriesUseCase class when will be use create method.', () => {
    expect(getCategoriesUseCase).toBeInstanceOf(GetCategoriesUseCase);
  });

  it('should be call execute method and return the categories filled list with CategoryDTO objects types', async () => {
    categoryServiceGatewayMock.getCategories.mockResolvedValue([
      {
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
        description: 'Restaurante',
        descriptionEnum: CategoryDescriptionEnum.RESTAURANT,
        group: CategoryGroupEnum.FOOD,
        type: CategoryType.BILLS,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '7276fa38-39a9-4a46-983a-0aa6d1b9dc17',
        description: 'Shopping',
        descriptionEnum: CategoryDescriptionEnum.CLOTHING_ACCESSORIES,
        group: CategoryGroupEnum.SHOPPING,
        type: CategoryType.BILLS,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '5157356a-48bf-42a7-b7da-b50e21e48cfe',
        description: 'Uber',
        descriptionEnum: CategoryDescriptionEnum.UBER,
        group: CategoryGroupEnum.MOBILITY_BY_APP,
        type: CategoryType.BILLS,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
    ]);

    const result = await getCategoriesUseCase.execute({});

    expect(result.data.length).toEqual(3);
    expect(categoryServiceGatewayMock.getCategories).toHaveBeenCalledWith({
      type: undefined,
    });
  });

  it('should be call execute method and return the categories empty list', async () => {
    categoryServiceGatewayMock.getCategories.mockResolvedValue([]);

    const result = await getCategoriesUseCase.execute({});

    expect(result.data.length).toEqual(0);
    expect(categoryServiceGatewayMock.getCategories).toHaveBeenCalledWith({
      type: undefined,
    });
  });

  it('should be call execute method with types params and check whether the getCategories method of the categoryGateway is receiving this type param.', async () => {
    categoryServiceGatewayMock.getCategories.mockResolvedValue([]);

    const type = CategoryType.RECEIVABLE;

    await getCategoriesUseCase.execute({ type });

    expect(categoryServiceGatewayMock.getCategories).toHaveBeenCalledWith({
      type: CategoryType.RECEIVABLE,
    });
  });
});
