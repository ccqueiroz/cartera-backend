import { GetReceivableByIdUseCase } from '@/usecases/receivable/get-receivable-by-id.usecase';
import { ReceivableGateway } from '@/domain/Receivable/gateway/receivable.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';

describe('GetReceivableByIdUseCase', () => {
  let receivableGatewayMock: jest.Mocked<ReceivableGateway>;
  let getReceivableByIdUseCase: GetReceivableByIdUseCase;

  const userIdMock = '1234567d';

  beforeEach(() => {
    receivableGatewayMock = {
      getReceivableById: jest.fn(),
    } as any;

    getReceivableByIdUseCase = GetReceivableByIdUseCase.create({
      receivableGateway: receivableGatewayMock,
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
    expect(receivableGatewayMock.getReceivableById).not.toHaveBeenCalled();
  });

  it('should return null if receivable is not found', async () => {
    receivableGatewayMock.getReceivableById.mockResolvedValueOnce(null);

    const result = await getReceivableByIdUseCase.execute({
      id: 'non-existent-id',
      userId: userIdMock,
    });

    expect(result).toEqual({ data: null });
    expect(receivableGatewayMock.getReceivableById).toHaveBeenCalledWith({
      id: 'non-existent-id',
      userId: userIdMock,
    });
  });

  it('should return the receivable if found', async () => {
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

    receivableGatewayMock.getReceivableById.mockResolvedValueOnce(
      receivableData,
    );

    const result = await getReceivableByIdUseCase.execute({
      id: receivableData.id,
      userId: userIdMock,
    });

    expect(result.data?.id).toBe(receivableData.id);

    expect(receivableGatewayMock.getReceivableById).toHaveBeenCalledWith({
      id: receivableData.id,
      userId: userIdMock,
    });
  });

  it('should handle missing optional fields gracefully', async () => {
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

    receivableGatewayMock.getReceivableById.mockResolvedValueOnce(
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

    expect(receivableGatewayMock.getReceivableById).toHaveBeenCalledWith({
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

    expect(receivableGatewayMock.getReceivableById).not.toHaveBeenCalled();
  });

  it('should be return data null when the response of the getReceivableById repository dont contain id', async () => {
    const receivableId = 'existent-id';

    const receivableData = {
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

    receivableGatewayMock.getReceivableById.mockResolvedValueOnce(
      receivableData,
    );

    const result = await getReceivableByIdUseCase.execute({
      id: receivableId,
      userId: userIdMock,
    });

    expect(result).toEqual({
      data: null,
    });

    expect(receivableGatewayMock.getReceivableById).toHaveBeenCalledWith({
      id: receivableId,
      userId: userIdMock,
    });
  });
});
