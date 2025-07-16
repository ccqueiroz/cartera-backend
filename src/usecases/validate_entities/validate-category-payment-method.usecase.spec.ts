import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryType } from '@/domain/Category/enums/category-type.enum';
import { CategoryServiceGateway } from '@/domain/Category/gateway/category.service.gateway';
import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { ApiError } from '@/helpers/errors';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';
import { ValidateCategoryPaymentMethodUseCase } from './validate-category-payment-method.usecase';

let categoryServiceGatewayMock: jest.Mocked<CategoryServiceGateway>;
let paymentMethodServiceGatewayMock: jest.Mocked<PaymentMethodServiceGateway>;

describe('ValidateCategoryPaymentMethodUseCase', () => {
  let useCase: ValidateCategoryPaymentMethodUseCase;

  beforeEach(() => {
    categoryServiceGatewayMock = {
      getCategoryById: jest.fn(),
    } as any;

    paymentMethodServiceGatewayMock = {
      getPaymentMethodById: jest.fn(),
    } as any;

    useCase = ValidateCategoryPaymentMethodUseCase.create({
      categoryService: categoryServiceGatewayMock,
      paymentMethodService: paymentMethodServiceGatewayMock,
    });
  });

  it('should create an instance of the use case', () => {
    expect(useCase).toBeInstanceOf(ValidateCategoryPaymentMethodUseCase);
  });

  it('should return true if category and payment method are valid', async () => {
    categoryServiceGatewayMock.getCategoryById.mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Uber',
      descriptionEnum: CategoryDescriptionEnum.UBER,
      group: CategoryGroupEnum.MOBILITY_BY_APP,
      type: CategoryType.BILLS,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    paymentMethodServiceGatewayMock.getPaymentMethodById.mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
      description: 'Cartão de Crédito',
      descriptionEnum: PaymentMethodDescriptionEnum.DEBIT_CARD,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const result = await useCase.execute({
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      paymentMethodId: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
    });

    expect(result).toBe(true);
  });

  it('should return true if paymentMethodId is not provided and category is valid', async () => {
    categoryServiceGatewayMock.getCategoryById.mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Manutenção Veículo',
      descriptionEnum: CategoryDescriptionEnum.VEHICLE_MAINTENANCE,
      group: CategoryGroupEnum.TRANSPORT,
      type: CategoryType.BILLS,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const result = await useCase.execute({
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });

    expect(result).toBe(true);
  });

  it('should return false if category is invalid', async () => {
    categoryServiceGatewayMock.getCategoryById.mockResolvedValue(null);

    paymentMethodServiceGatewayMock.getPaymentMethodById.mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
      description: 'Cartão de Débito',
      descriptionEnum: PaymentMethodDescriptionEnum.DEBIT_CARD,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const result = await useCase.execute({
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      paymentMethodId: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
    });

    expect(result).toBe(false);
  });

  it('should return false if payment method is invalid', async () => {
    categoryServiceGatewayMock.getCategoryById.mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Manutenção Veículo',
      descriptionEnum: CategoryDescriptionEnum.VEHICLE_MAINTENANCE,
      group: CategoryGroupEnum.TRANSPORT,
      type: CategoryType.BILLS,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    paymentMethodServiceGatewayMock.getPaymentMethodById.mockResolvedValue(
      null,
    );

    const result = await useCase.execute({
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      paymentMethodId: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
    });

    expect(result).toBe(false);
  });

  it('should return false if category throws error', async () => {
    categoryServiceGatewayMock.getCategoryById.mockRejectedValue(
      new ApiError('erro', 500),
    );

    const result = await useCase.execute({
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      paymentMethodId: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
    });

    expect(result).toBe(false);
  });

  it('should return false if payment method throws error', async () => {
    categoryServiceGatewayMock.getCategoryById.mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Manutenção Veículo',
      descriptionEnum: CategoryDescriptionEnum.VEHICLE_MAINTENANCE,
      group: CategoryGroupEnum.TRANSPORT,
      type: CategoryType.BILLS,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    paymentMethodServiceGatewayMock.getPaymentMethodById.mockRejectedValue(
      new ApiError('erro', 500),
    );

    const result = await useCase.execute({
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      paymentMethodId: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
    });

    expect(result).toBe(false);
  });
});
