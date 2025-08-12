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
      getCategoryByDescriptionEnum: jest.fn(),
    } as any;

    paymentMethodServiceGatewayMock = {
      getPaymentMethodByDescriptionEnum: jest.fn(),
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
    categoryServiceGatewayMock.getCategoryByDescriptionEnum.mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Uber',
      descriptionEnum: CategoryDescriptionEnum.UBER,
      group: CategoryGroupEnum.MOBILITY_BY_APP,
      type: CategoryType.BILLS,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    paymentMethodServiceGatewayMock.getPaymentMethodByDescriptionEnum.mockResolvedValue(
      {
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
        description: 'Cartão de Crédito',
        descriptionEnum: PaymentMethodDescriptionEnum.DEBIT_CARD,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    );

    const result = await useCase.execute({
      categoryDescriptionEnum: CategoryDescriptionEnum.UBER,
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.DEBIT_CARD,
    });

    expect(result.isValidEntities).toBe(true);
    expect(result.category?.id).toBe('e76176ad-c2d8-4526-95cb-0440d0149dd4');
    expect(result.paymentMethod?.id).toBe(
      'e76176ad-c2d8-4526-95cb-0440d0149dc6',
    );
  });

  it('should return true if paymentMethodDescriptionEnum is not provided and category is valid', async () => {
    categoryServiceGatewayMock.getCategoryByDescriptionEnum.mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Manutenção Veículo',
      descriptionEnum: CategoryDescriptionEnum.VEHICLE_MAINTENANCE,
      group: CategoryGroupEnum.TRANSPORT,
      type: CategoryType.BILLS,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const result = await useCase.execute({
      categoryDescriptionEnum: CategoryDescriptionEnum.VEHICLE_MAINTENANCE,
    });

    expect(result.isValidEntities).toBe(true);
    expect(result.category?.id).toBe('e76176ad-c2d8-4526-95cb-0440d0149dd4');
    expect(result.paymentMethod).toBeNull();
  });

  it('should return false if category is invalid', async () => {
    categoryServiceGatewayMock.getCategoryByDescriptionEnum.mockResolvedValue(
      null,
    );

    paymentMethodServiceGatewayMock.getPaymentMethodByDescriptionEnum.mockResolvedValue(
      {
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
        description: 'Cartão de Débito',
        descriptionEnum: PaymentMethodDescriptionEnum.DEBIT_CARD,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    );

    const result = await useCase.execute({
      categoryDescriptionEnum: CategoryDescriptionEnum.VEHICLE_MAINTENANCE,
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.DEBIT_CARD,
    });

    expect(result.isValidEntities).toBe(false);
    expect(result.category).toBeNull();
    expect(result.paymentMethod?.id).toBe(
      'e76176ad-c2d8-4526-95cb-0440d0149dc6',
    );
  });

  it('should return false if payment method is invalid', async () => {
    categoryServiceGatewayMock.getCategoryByDescriptionEnum.mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Manutenção Veículo',
      descriptionEnum: CategoryDescriptionEnum.VEHICLE_MAINTENANCE,
      group: CategoryGroupEnum.TRANSPORT,
      type: CategoryType.BILLS,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    paymentMethodServiceGatewayMock.getPaymentMethodByDescriptionEnum.mockResolvedValue(
      null,
    );

    const result = await useCase.execute({
      categoryDescriptionEnum: CategoryDescriptionEnum.VEHICLE_MAINTENANCE,
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.DEBIT_CARD,
    });

    expect(result.isValidEntities).toBe(false);
    expect(result.category?.id).toBe('e76176ad-c2d8-4526-95cb-0440d0149dd4');
    expect(result.paymentMethod).toBeNull();
  });

  it('should return false if category throws error', async () => {
    categoryServiceGatewayMock.getCategoryByDescriptionEnum.mockRejectedValue(
      new ApiError('erro', 500),
    );

    const result = await useCase.execute({
      categoryDescriptionEnum: CategoryDescriptionEnum.VEHICLE_MAINTENANCE,
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.DEBIT_CARD,
    });

    expect(result.isValidEntities).toBe(false);
    expect(result.category).toBeNull();
    expect(result.paymentMethod).toBeNull();
  });

  it('should return false if payment method throws error', async () => {
    categoryServiceGatewayMock.getCategoryByDescriptionEnum.mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Manutenção Veículo',
      descriptionEnum: CategoryDescriptionEnum.VEHICLE_MAINTENANCE,
      group: CategoryGroupEnum.TRANSPORT,
      type: CategoryType.BILLS,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    paymentMethodServiceGatewayMock.getPaymentMethodByDescriptionEnum.mockRejectedValue(
      new ApiError('erro', 500),
    );

    const result = await useCase.execute({
      categoryDescriptionEnum: CategoryDescriptionEnum.VEHICLE_MAINTENANCE,
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.DEBIT_CARD,
    });

    expect(result.isValidEntities).toBe(false);
    expect(result.category?.id).toBe('e76176ad-c2d8-4526-95cb-0440d0149dd4');
    expect(result.paymentMethod).toBeNull();
  });
});
