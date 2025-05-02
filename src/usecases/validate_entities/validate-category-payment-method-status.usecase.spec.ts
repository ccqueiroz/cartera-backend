import { ValidateCategoryPaymentMethodStatusUseCase } from './validate-category-payment-method-status.usecase';
import { ApiError } from '@/helpers/errors';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';
import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { PaymentStatusServiceGateway } from '@/domain/Payment_Status/gateway/payment-status.service.gateway';

let categoryServiceGatewayMock: jest.Mocked<CategoryServiceGateway>;
let paymentMethodServiceGatewayMock: jest.Mocked<PaymentMethodServiceGateway>;
let paymentStatusServiceGatewayMock: jest.Mocked<PaymentStatusServiceGateway>;

describe('ValidateCategoryPaymentMethodStatusUseCase', () => {
  let validateCategoryPaymentMethodStatusUseCase: ValidateCategoryPaymentMethodStatusUseCase;

  beforeEach(() => {
    categoryServiceGatewayMock = {
      getCategoryById: jest.fn(),
    } as any;

    paymentMethodServiceGatewayMock = {
      getPaymentMethodById: jest.fn(),
    } as any;

    paymentStatusServiceGatewayMock = {
      getPaymentStatusById: jest.fn(),
    } as any;

    validateCategoryPaymentMethodStatusUseCase =
      ValidateCategoryPaymentMethodStatusUseCase.create({
        categoryService: categoryServiceGatewayMock,
        paymentMethodService: paymentMethodServiceGatewayMock,
        paymentStatusServiceGateway: paymentStatusServiceGatewayMock,
      });
  });

  it('should be create an instance of the ValidateCategoryPaymentMethodStatusUseCase class when the create method is used', () => {
    expect(validateCategoryPaymentMethodStatusUseCase).toBeInstanceOf(
      ValidateCategoryPaymentMethodStatusUseCase,
    );
  });

  it('should return true if all entities (category, payment method, and payment status) are valid', async () => {
    categoryServiceGatewayMock.getCategoryById = jest.fn().mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Receitas Diversas',
      type: CategoryType.BILLS,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    });

    paymentMethodServiceGatewayMock.getPaymentMethodById = jest
      .fn()
      .mockResolvedValue({
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
        description: 'Cartão de crédito',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      });

    paymentStatusServiceGatewayMock.getPaymentStatusById = jest
      .fn()
      .mockResolvedValue({
        id: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
        description: 'A receber',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      });

    const result = await validateCategoryPaymentMethodStatusUseCase.execute({
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      paymentMethodId: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
      paymentStatusId: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
    });

    expect(result).toBe(true);

    expect(categoryServiceGatewayMock.getCategoryById).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });
    expect(
      paymentMethodServiceGatewayMock.getPaymentMethodById,
    ).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
    });
    expect(
      paymentStatusServiceGatewayMock.getPaymentStatusById,
    ).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
    });
  });

  it('should return false if any entity (category, payment method, or payment status) is invalid', async () => {
    categoryServiceGatewayMock.getCategoryById = jest
      .fn()
      .mockResolvedValue(null);

    paymentMethodServiceGatewayMock.getPaymentMethodById = jest
      .fn()
      .mockResolvedValue({
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
        description: 'Cartão de crédito',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      });

    paymentStatusServiceGatewayMock.getPaymentStatusById = jest
      .fn()
      .mockResolvedValue({
        id: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
        description: 'A receber',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      });

    const result = await validateCategoryPaymentMethodStatusUseCase.execute({
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      paymentMethodId: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
      paymentStatusId: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
    });

    expect(result).toBe(false);

    expect(categoryServiceGatewayMock.getCategoryById).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });
    expect(
      paymentMethodServiceGatewayMock.getPaymentMethodById,
    ).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
    });
    expect(
      paymentStatusServiceGatewayMock.getPaymentStatusById,
    ).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
    });
  });

  it('should return false if one of the services throws an error', async () => {
    categoryServiceGatewayMock.getCategoryById = jest.fn().mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Receitas Diversas',
      type: CategoryType.BILLS,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    });

    paymentMethodServiceGatewayMock.getPaymentMethodById = jest
      .fn()
      .mockRejectedValue(new ApiError('Service Error', 500));

    paymentStatusServiceGatewayMock.getPaymentStatusById = jest
      .fn()
      .mockResolvedValue({
        id: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
        description: 'A receber',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      });

    const result = await validateCategoryPaymentMethodStatusUseCase.execute({
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      paymentMethodId: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
      paymentStatusId: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
    });

    expect(result).toBe(false);

    expect(categoryServiceGatewayMock.getCategoryById).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });
    expect(
      paymentMethodServiceGatewayMock.getPaymentMethodById,
    ).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
    });
    expect(
      paymentStatusServiceGatewayMock.getPaymentStatusById,
    ).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
    });
  });

  it('should return false if all entities are invalid', async () => {
    categoryServiceGatewayMock.getCategoryById = jest
      .fn()
      .mockResolvedValue(null);

    paymentMethodServiceGatewayMock.getPaymentMethodById = jest
      .fn()
      .mockResolvedValue(null);

    paymentStatusServiceGatewayMock.getPaymentStatusById = jest
      .fn()
      .mockResolvedValue(null);

    const result = await validateCategoryPaymentMethodStatusUseCase.execute({
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      paymentMethodId: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
      paymentStatusId: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
    });

    expect(result).toBe(false);

    expect(categoryServiceGatewayMock.getCategoryById).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });
    expect(
      paymentMethodServiceGatewayMock.getPaymentMethodById,
    ).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
    });
    expect(
      paymentStatusServiceGatewayMock.getPaymentStatusById,
    ).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
    });
  });
});
