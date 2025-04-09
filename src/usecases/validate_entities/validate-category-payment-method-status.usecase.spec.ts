import { ValidateCategoryPaymentMethodStatusUseCase } from './validate-category-payment-method-status.usecase';
import { ApiError } from '@/helpers/errors';
import { CategoryGateway } from '@/domain/Category/gateway/category.gateway';
import { PaymentMethodGateway } from '@/domain/Payment_Method/gateway/payment-method.gateway';
import { PaymentStatusGateway } from '@/domain/Payment_Status/gateway/payment-status.gateway';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';

let categoryGatewayMock: jest.Mocked<CategoryGateway>;
let paymentMethodGatewayMock: jest.Mocked<PaymentMethodGateway>;
let paymentStatusGatewayMock: jest.Mocked<PaymentStatusGateway>;

describe('ValidateCategoryPaymentMethodStatusUseCase', () => {
  let validateCategoryPaymentMethodStatusUseCase: ValidateCategoryPaymentMethodStatusUseCase;

  beforeEach(() => {
    categoryGatewayMock = {
      getCategoryById: jest.fn(),
    } as any;

    paymentMethodGatewayMock = {
      getPaymentMethodById: jest.fn(),
    } as any;

    paymentStatusGatewayMock = {
      getPaymentStatusById: jest.fn(),
    } as any;

    validateCategoryPaymentMethodStatusUseCase =
      ValidateCategoryPaymentMethodStatusUseCase.create({
        categoryGateway: categoryGatewayMock,
        paymentMethodGateway: paymentMethodGatewayMock,
        paymentStatusGateway: paymentStatusGatewayMock,
      });
  });

  it('should be create an instance of the ValidateCategoryPaymentMethodStatusUseCase class when the create method is used', () => {
    expect(validateCategoryPaymentMethodStatusUseCase).toBeInstanceOf(
      ValidateCategoryPaymentMethodStatusUseCase,
    );
  });

  it('should return true if all entities (category, payment method, and payment status) are valid', async () => {
    categoryGatewayMock.getCategoryById = jest.fn().mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Receitas Diversas',
      type: CategoryType.BILLS,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    });

    paymentMethodGatewayMock.getPaymentMethodById = jest
      .fn()
      .mockResolvedValue({
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
        description: 'Cartão de crédito',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      });

    paymentStatusGatewayMock.getPaymentStatusById = jest
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

    expect(categoryGatewayMock.getCategoryById).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });
    expect(paymentMethodGatewayMock.getPaymentMethodById).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
    });
    expect(paymentStatusGatewayMock.getPaymentStatusById).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
    });
  });

  it('should return false if any entity (category, payment method, or payment status) is invalid', async () => {
    categoryGatewayMock.getCategoryById = jest.fn().mockResolvedValue(null);

    paymentMethodGatewayMock.getPaymentMethodById = jest
      .fn()
      .mockResolvedValue({
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
        description: 'Cartão de crédito',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      });

    paymentStatusGatewayMock.getPaymentStatusById = jest
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

    expect(categoryGatewayMock.getCategoryById).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });
    expect(paymentMethodGatewayMock.getPaymentMethodById).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
    });
    expect(paymentStatusGatewayMock.getPaymentStatusById).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
    });
  });

  it('should return false if one of the services throws an error', async () => {
    categoryGatewayMock.getCategoryById = jest.fn().mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Receitas Diversas',
      type: CategoryType.BILLS,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    });

    paymentMethodGatewayMock.getPaymentMethodById = jest
      .fn()
      .mockRejectedValue(new ApiError('Service Error', 500));

    paymentStatusGatewayMock.getPaymentStatusById = jest
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

    expect(categoryGatewayMock.getCategoryById).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });
    expect(paymentMethodGatewayMock.getPaymentMethodById).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
    });
    expect(paymentStatusGatewayMock.getPaymentStatusById).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
    });
  });

  it('should return false if all entities are invalid', async () => {
    categoryGatewayMock.getCategoryById = jest.fn().mockResolvedValue(null);

    paymentMethodGatewayMock.getPaymentMethodById = jest
      .fn()
      .mockResolvedValue(null);

    paymentStatusGatewayMock.getPaymentStatusById = jest
      .fn()
      .mockResolvedValue(null);

    const result = await validateCategoryPaymentMethodStatusUseCase.execute({
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      paymentMethodId: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
      paymentStatusId: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
    });

    expect(result).toBe(false);

    expect(categoryGatewayMock.getCategoryById).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });
    expect(paymentMethodGatewayMock.getPaymentMethodById).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
    });
    expect(paymentStatusGatewayMock.getPaymentStatusById).toHaveBeenCalledWith({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
    });
  });
});
