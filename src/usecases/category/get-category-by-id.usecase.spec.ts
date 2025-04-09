import { CategoryGateway } from '@/domain/Category/gateway/category.gateway';
import { GetCategoryByIdUseCase } from './get-category-by-id.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';

let categoryUserGatewayMock: jest.Mocked<CategoryGateway>;

describe('Get Category By Id', () => {
  let getCategoryByIdUseCase: GetCategoryByIdUseCase;

  beforeEach(() => {
    categoryUserGatewayMock = {
      getCategoryById: jest.fn(),
    } as any;

    getCategoryByIdUseCase = GetCategoryByIdUseCase.create({
      categoryGateway: categoryUserGatewayMock,
    });
  });

  it('should be create a instance of the GetCategoryByIdUseCase class when will be use create method.', () => {
    expect(getCategoryByIdUseCase).toBeInstanceOf(GetCategoryByIdUseCase);
  });

  it('should be call execute method and return the category when this id are provided', async () => {
    categoryUserGatewayMock.getCategoryById.mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Aluguel e Financiamento Residencial',
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
    categoryUserGatewayMock.getCategoryById.mockResolvedValue(null);

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

    expect(categoryUserGatewayMock.getCategoryById).not.toHaveBeenCalled();
  });
});
