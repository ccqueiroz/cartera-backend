import { GetCategoryByIdUseCase } from './get-category-by-id.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';

let categoryServiceGatewayMock: jest.Mocked<CategoryServiceGateway>;

describe('Get Category By Id', () => {
  let getCategoryByIdUseCase: GetCategoryByIdUseCase;

  beforeEach(() => {
    categoryServiceGatewayMock = {
      getCategoryById: jest.fn(),
    } as any;

    getCategoryByIdUseCase = GetCategoryByIdUseCase.create({
      categoryService: categoryServiceGatewayMock,
    });
  });

  it('should be create a instance of the GetCategoryByIdUseCase class when will be use create method.', () => {
    expect(getCategoryByIdUseCase).toBeInstanceOf(GetCategoryByIdUseCase);
  });

  it('should be call execute method and return the category when this id are provided', async () => {
    categoryServiceGatewayMock.getCategoryById.mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Aluguel',
      descriptionEnum: CategoryDescriptionEnum.RENT,
      group: CategoryGroupEnum.HOUSING,
      type: CategoryType.BILLS,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    });

    const result = await getCategoryByIdUseCase.execute({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });

    expect(result.data?.id).toBe('e76176ad-c2d8-4526-95cb-0440d0149dd4');
  });

  it('should be call execute method and return null when this id are provided but this payment method is not exist.', async () => {
    categoryServiceGatewayMock.getCategoryById.mockResolvedValue(null);

    const result = await getCategoryByIdUseCase.execute({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });

    expect(result.data).toBeNull();
  });

  it('should call execute method when id not provided', async () => {
    const error = await getCategoryByIdUseCase
      .execute({
        id: '',
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });

    expect(categoryServiceGatewayMock.getCategoryById).not.toHaveBeenCalled();
  });
});
