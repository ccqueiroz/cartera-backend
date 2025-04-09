import { DeleteReceivableUseCase } from './delete-receivable.usecase';
import { ReceivableGateway } from '@/domain/Receivable/gateway/receivable.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';

let receivableGatewayMock: jest.Mocked<ReceivableGateway>;
let deleteReceivableUseCase: DeleteReceivableUseCase;

const userIdMock = '1234567d';

describe('DeleteReceivableUseCase', () => {
  beforeEach(() => {
    receivableGatewayMock = {
      deleteReceivable: jest.fn(),
      getReceivableById: jest.fn(),
    } as any;

    deleteReceivableUseCase = DeleteReceivableUseCase.create({
      receivableGateway: receivableGatewayMock,
    });
  });

  it('should be create a instance of the DeleteReceivableUseCase class when will be use create method.', () => {
    expect(deleteReceivableUseCase).toBeInstanceOf(DeleteReceivableUseCase);
  });

  it('should delete a receivable when a valid ID is provided', async () => {
    const receivableData = {
      id: 'e76176ad-c2d8-4526-95cb-1434d5149dd4',
      categoryId: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      paymentMethodId: 'e76176ad-c2d8-4526-95cb-0440d0149dc6',
      paymentStatusId: 'e76176ad-c2d8-4526-95cb-0440d0149d87',
      personUserId: 'e76176ad-c2d8-4526-95cb-123456749d87',
      userId: '1234567d-c2d8-4526-95cb-123456749d87',
      descriptionReceivable: 'Test Receivable',
      fixedReceivable: true,
      receivableDate: new Date().getTime(),
      icon: null,
      amount: 100,
      categoryDescription: 'Test Category',
      paymentMethodDescription: 'Test Payment Method',
      paymentStatusDescription: 'Paid',
      receival: false,
      receivalDate: null,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    receivableGatewayMock.getReceivableById.mockResolvedValue({
      ...receivableData,
    });

    receivableGatewayMock.deleteReceivable.mockResolvedValue();

    await deleteReceivableUseCase.execute({
      id: receivableData.id,
      userId: userIdMock,
    });

    expect(receivableGatewayMock.getReceivableById).toHaveBeenCalledWith({
      id: receivableData.id,
      userId: userIdMock,
    });

    expect(receivableGatewayMock.deleteReceivable).toHaveBeenCalledWith({
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
    expect(receivableGatewayMock.getReceivableById).not.toHaveBeenCalled();
    expect(receivableGatewayMock.deleteReceivable).not.toHaveBeenCalled();
  });

  it('should throw an error if the receivable does not exist', async () => {
    const receivableId = 'non-existent-id';

    receivableGatewayMock.getReceivableById.mockResolvedValue(null);

    const error = await deleteReceivableUseCase
      .execute({ id: receivableId, userId: userIdMock })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.RECEIVABLE_NOT_FOUND,
      statusCode: 404,
    });
    expect(receivableGatewayMock.getReceivableById).toHaveBeenCalledWith({
      id: receivableId,
      userId: userIdMock,
    });
    expect(receivableGatewayMock.deleteReceivable).not.toHaveBeenCalled();
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

    expect(receivableGatewayMock.deleteReceivable).not.toHaveBeenCalled();
  });
});
