import { DeleteReceivableUseCase } from './delete-receivable.usecase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';

let receivableServiceMock: jest.Mocked<ReceivableServiceGateway>;
let deleteReceivableUseCase: DeleteReceivableUseCase;

const userIdMock = '1234567d';

describe('DeleteReceivableUseCase', () => {
  beforeEach(() => {
    receivableServiceMock = {
      deleteReceivable: jest.fn(),
      getReceivableById: jest.fn(),
    } as any;

    deleteReceivableUseCase = DeleteReceivableUseCase.create({
      receivableService: receivableServiceMock,
    });
  });

  it('should be create a instance of the DeleteReceivableUseCase class when will be use create method.', () => {
    expect(deleteReceivableUseCase).toBeInstanceOf(DeleteReceivableUseCase);
  });

  it('should delete a receivable when a valid ID is provided', async () => {
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

    receivableServiceMock.getReceivableById.mockResolvedValue({
      ...receivableData,
    });

    receivableServiceMock.deleteReceivable.mockResolvedValue();

    await deleteReceivableUseCase.execute({
      id: receivableData.id,
      userId: userIdMock,
    });

    expect(receivableServiceMock.getReceivableById).toHaveBeenCalledWith({
      id: receivableData.id,
      userId: userIdMock,
    });

    expect(receivableServiceMock.deleteReceivable).toHaveBeenCalledWith({
      id: receivableData.id,
      userId: userIdMock,
    });
  });

  it('should throw an error if the ID is missing', async () => {
    const error = await deleteReceivableUseCase
      .execute({ id: '', userId: userIdMock })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });
    expect(receivableServiceMock.getReceivableById).not.toHaveBeenCalled();
    expect(receivableServiceMock.deleteReceivable).not.toHaveBeenCalled();
  });

  it('should throw an error if the receivable does not exist', async () => {
    const receivableId = 'non-existent-id';

    receivableServiceMock.getReceivableById.mockResolvedValue(null);

    const error = await deleteReceivableUseCase
      .execute({ id: receivableId, userId: userIdMock })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.RECEIVABLE_NOT_FOUND,
      statusCode: 404,
    });
    expect(receivableServiceMock.getReceivableById).toHaveBeenCalledWith({
      id: receivableId,
      userId: userIdMock,
    });
    expect(receivableServiceMock.deleteReceivable).not.toHaveBeenCalled();
  });

  it('should be throw an error if the userId does not passed', async () => {
    const receivableId = 'existent-id';

    const error = await deleteReceivableUseCase
      .execute({ id: receivableId, userId: '' })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      statusCode: 401,
    });

    expect(receivableServiceMock.deleteReceivable).not.toHaveBeenCalled();
  });
});
