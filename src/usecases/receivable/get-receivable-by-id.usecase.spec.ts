import { GetReceivableByIdUseCase } from '@/usecases/receivable/get-receivable-by-id.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';

describe('GetReceivableByIdUseCase', () => {
  let receivableServiceMock: jest.Mocked<ReceivableServiceGateway>;
  let getReceivableByIdUseCase: GetReceivableByIdUseCase;

  const userIdMock = '1234567d';

  beforeEach(() => {
    receivableServiceMock = {
      getReceivableById: jest.fn(),
    } as any;

    getReceivableByIdUseCase = GetReceivableByIdUseCase.create({
      receivableService: receivableServiceMock,
    });
  });

  it('should throw an error if receivableId is not provided', async () => {
    const error = await getReceivableByIdUseCase
      .execute({
        id: '',
        userId: userIdMock,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });
    expect(receivableServiceMock.getReceivableById).not.toHaveBeenCalled();
  });

  it('should return null if receivable is not found', async () => {
    receivableServiceMock.getReceivableById.mockResolvedValueOnce(null);

    const result = await getReceivableByIdUseCase.execute({
      id: 'non-existent-id',
      userId: userIdMock,
    });

    expect(result).toEqual({ data: null });
    expect(receivableServiceMock.getReceivableById).toHaveBeenCalledWith({
      id: 'non-existent-id',
      userId: userIdMock,
    });
  });

  it('should return the receivable if found', async () => {
    const receivableData = {
      id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      paymentMethodDescription: 'Pix',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    receivableServiceMock.getReceivableById.mockResolvedValueOnce(
      receivableData,
    );

    const result = await getReceivableByIdUseCase.execute({
      id: receivableData.id,
      userId: userIdMock,
    });

    expect(result.data?.id).toBe(receivableData.id);

    expect(receivableServiceMock.getReceivableById).toHaveBeenCalledWith({
      id: receivableData.id,
      userId: userIdMock,
    });
  });

  it('should handle missing optional fields gracefully', async () => {
    const receivableData = {
      id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      paymentMethodId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      paymentMethodDescription: 'Pix',
      paymentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    receivableServiceMock.getReceivableById.mockResolvedValueOnce(
      receivableData,
    );

    const result = await getReceivableByIdUseCase.execute({
      id: receivableData.id,
      userId: userIdMock,
    });

    expect(result).toEqual({
      data: {
        ...receivableData,
        createdAt: expect.any(Number),
      },
    });

    expect(receivableServiceMock.getReceivableById).toHaveBeenCalledWith({
      id: receivableData.id,
      userId: userIdMock,
    });
  });

  it('should be throw an error if the userId does not passed', async () => {
    const receivableId = 'existent-id';

    const error = await getReceivableByIdUseCase
      .execute({ id: receivableId, userId: '' })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      statusCode: 401,
    });

    expect(receivableServiceMock.getReceivableById).not.toHaveBeenCalled();
  });

  it('should be return data null when the response of the getReceivableById repository dont contain id', async () => {
    const receivableId = 'existent-id';

    receivableServiceMock.getReceivableById.mockResolvedValueOnce(null);

    const result = await getReceivableByIdUseCase.execute({
      id: receivableId,
      userId: userIdMock,
    });

    expect(result).toEqual({
      data: null,
    });

    expect(receivableServiceMock.getReceivableById).toHaveBeenCalledWith({
      id: receivableId,
      userId: userIdMock,
    });
  });
});
