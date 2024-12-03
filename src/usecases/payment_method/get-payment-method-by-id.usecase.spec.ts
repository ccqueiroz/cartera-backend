import { PaymentMethodGateway } from '@/domain/Payment_Method/gateway/payment-method.gateway';
import { GetPaymentMethodByIdUseCase } from './get-payment-method-by-id.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

let paymentMethodUserGatewayMock: jest.Mocked<PaymentMethodGateway>;

describe('Get Payment Methods', () => {
  let getPaymentMethodByIdUseCase: GetPaymentMethodByIdUseCase;

  beforeEach(() => {
    paymentMethodUserGatewayMock = {
      getPaymentMethods: jest.fn(),
      getPaymentMethodById: jest.fn(),
    };

    getPaymentMethodByIdUseCase = GetPaymentMethodByIdUseCase.create({
      paymentMethodGateway: paymentMethodUserGatewayMock,
    });
  });

  it('should be create a instance of the GetPaymentMethodByIdUseCase class when will be use create method.', () => {
    expect(getPaymentMethodByIdUseCase).toBeInstanceOf(
      GetPaymentMethodByIdUseCase,
    );
  });

  it('should be call execute method and return the payment method when this id are provided', async () => {
    paymentMethodUserGatewayMock.getPaymentMethodById.mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Cartão de crédito',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const result = await getPaymentMethodByIdUseCase.execute({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });

    expect(result.data?.id).toBe('e76176ad-c2d8-4526-95cb-0440d0149dd4');
  });

  it('should be call execute method and return null when this id are provided but this payment method is not exist.', async () => {
    paymentMethodUserGatewayMock.getPaymentMethodById.mockResolvedValue(null);

    const result = await getPaymentMethodByIdUseCase.execute({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });

    expect(result.data).toBeNull();
  });

  it('should call execute method when id not provided', async () => {
    const error = await getPaymentMethodByIdUseCase
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
      paymentMethodUserGatewayMock.getPaymentMethodById,
    ).not.toHaveBeenCalled();
  });
});
