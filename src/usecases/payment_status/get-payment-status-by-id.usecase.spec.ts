import { PaymentStatusGateway } from '@/domain/Payment_Status/gateway/payment-status.gateway';
import { GetPaymentStatusByIdUseCase } from './get-payment-status-by-id.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

let paymentStatusUserGatewayMock: jest.Mocked<PaymentStatusGateway>;

describe('Get Payment Status By Id', () => {
  let getPaymentStatusByIdUseCase: GetPaymentStatusByIdUseCase;

  beforeEach(() => {
    paymentStatusUserGatewayMock = {
      getPaymentStatusById: jest.fn(),
    } as any;

    getPaymentStatusByIdUseCase = GetPaymentStatusByIdUseCase.create({
      paymentStatusGateway: paymentStatusUserGatewayMock,
    });
  });

  it('should be create a instance of the GetPaymentStatusByIdUseCase class when will be use create method.', () => {
    expect(getPaymentStatusByIdUseCase).toBeInstanceOf(
      GetPaymentStatusByIdUseCase,
    );
  });

  it('should be call execute method and return the payment status when this id are provided', async () => {
    paymentStatusUserGatewayMock.getPaymentStatusById.mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'A receber',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    });

    const result = await getPaymentStatusByIdUseCase.execute({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });

    expect(result.data?.id).toBe('e76176ad-c2d8-4526-95cb-0440d0149dd4');
  });

  it('should be call execute method and return null when this id are provided but this payment status is not exist.', async () => {
    paymentStatusUserGatewayMock.getPaymentStatusById.mockResolvedValue(null);

    const result = await getPaymentStatusByIdUseCase.execute({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });

    expect(result.data).toBeNull();
  });

  it('should call execute method when id not provided', async () => {
    const error = await getPaymentStatusByIdUseCase
      .execute({
        id: '',
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });

    expect(
      paymentStatusUserGatewayMock.getPaymentStatusById,
    ).not.toHaveBeenCalled();
  });
});
