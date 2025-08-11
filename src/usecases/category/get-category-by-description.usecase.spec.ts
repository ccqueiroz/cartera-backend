import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { GetCategoryByDescriptionUseCase } from './get-category-by-description.usecase';

let categoryServiceGatewayMock: jest.Mocked<CategoryServiceGateway>;

describe('Get Category By Description Enum', () => {
  let getCategoryByDescriptionEnumUseCase: GetCategoryByDescriptionUseCase;

  beforeEach(() => {
    categoryServiceGatewayMock = {
      getCategoryByDescriptionEnum: jest.fn(),
    } as any;

    getCategoryByDescriptionEnumUseCase =
      GetCategoryByDescriptionUseCase.create({
        categoryService: categoryServiceGatewayMock,
      });
  });

  it('should be create a instance of the GetCategoryByDescriptionUseCase class when will be use create method.', () => {
    expect(getCategoryByDescriptionEnumUseCase).toBeInstanceOf(
      GetCategoryByDescriptionUseCase,
    );
  });

  it('should be call execute method and return the category when this descriptionEnum are provided', async () => {
    categoryServiceGatewayMock.getCategoryByDescriptionEnum.mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Aluguel',
      descriptionEnum: CategoryDescriptionEnum.RENT,
      group: CategoryGroupEnum.HOUSING,
      type: CategoryType.BILLS,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    });

    const result = await getCategoryByDescriptionEnumUseCase.execute({
      descriptionEnum: CategoryDescriptionEnum.RENT,
    });

    expect(result.data?.id).toBe('e76176ad-c2d8-4526-95cb-0440d0149dd4');
  });

  it('should be call execute method and return null when this descriptionEnum are provided but dont exist in the base.', async () => {
    categoryServiceGatewayMock.getCategoryByDescriptionEnum.mockResolvedValue(
      null,
    );

    const result = await getCategoryByDescriptionEnumUseCase.execute({
      descriptionEnum: CategoryDescriptionEnum.RENT,
    });

    expect(result.data).toBeNull();
  });

  it('should call execute method when descriptionEnum not provided', async () => {
    const error = await getCategoryByDescriptionEnumUseCase
      .execute({
        descriptionEnum: '' as any,
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });

    expect(
      categoryServiceGatewayMock.getCategoryByDescriptionEnum,
    ).not.toHaveBeenCalled();
  });
});
