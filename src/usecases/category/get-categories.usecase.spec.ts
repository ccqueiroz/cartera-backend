import { CategoryGateway } from '@/domain/Category/gateway/category.gateway';
import { GetCategoriesUseCase } from './get-categories.usecase';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';

let categoryUserGatewayMock: jest.Mocked<CategoryGateway>;

describe('Get Categories', () => {
  let getCategoriesUseCase: GetCategoriesUseCase;

  beforeEach(() => {
    categoryUserGatewayMock = {
      getCategories: jest.fn(),
      getCategoryById: jest.fn(),
    };

    getCategoriesUseCase = GetCategoriesUseCase.create({
      categoryGateway: categoryUserGatewayMock,
    });
  });

  it('should be create a instance of the GetCategoriesUseCase class when will be use create method.', () => {
    expect(getCategoriesUseCase).toBeInstanceOf(GetCategoriesUseCase);
  });

  it('should be call execute method and return the categories filled list with CategoryDTO objects types', async () => {
    categoryUserGatewayMock.getCategories.mockResolvedValue([
      {
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
        description: 'Restaurante',
        type: CategoryType.BILLS,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '7276fa38-39a9-4a46-983a-0aa6d1b9dc17',
        description: 'Shopping',
        type: CategoryType.BILLS,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '5157356a-48bf-42a7-b7da-b50e21e48cfe',
        description: 'App Mobilidade',
        type: CategoryType.BILLS,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: 'e6c30985-de80-4d5b-aebd-95e9eb49dc8d',
        description: 'Recebimento por Serviço Prestado',
        type: CategoryType.RECEIVABLE,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
    ]);

    const result = await getCategoriesUseCase.execute();

    expect(result.data.length).toEqual(4);
    expect(categoryUserGatewayMock.getCategories).toHaveBeenCalledWith({
      type: undefined,
    });
  });

  it('should be call execute method and return the categories empty list', async () => {
    categoryUserGatewayMock.getCategories.mockResolvedValue([]);

    const result = await getCategoriesUseCase.execute();

    expect(result.data.length).toEqual(0);
    expect(categoryUserGatewayMock.getCategories).toHaveBeenCalledWith({
      type: undefined,
    });
  });

  it('should be call execute method with types params and check whether the getCategories method of the categoryGateway is receiving this type param.', async () => {
    categoryUserGatewayMock.getCategories.mockResolvedValue([]);

    const type = CategoryType.RECEIVABLE;

    await getCategoriesUseCase.execute({ type });

    expect(categoryUserGatewayMock.getCategories).toHaveBeenCalledWith({
      type: CategoryType.RECEIVABLE,
    });
  });
});
