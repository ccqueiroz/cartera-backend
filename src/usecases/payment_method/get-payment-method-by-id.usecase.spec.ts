import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { GetPaymentMethodByIdUseCase } from './get-payment-method-by-id.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';

let paymentMethodServiceGatewayMock: jest.Mocked<PaymentMethodServiceGateway>;

describe('Get Payment Method By Id', () => {
  let getPaymentMethodByIdUseCase: GetPaymentMethodByIdUseCase;

  beforeEach(() => {
    paymentMethodServiceGatewayMock = {
      getPaymentMethodById: jest.fn(),
    } as any;

    getPaymentMethodByIdUseCase = GetPaymentMethodByIdUseCase.create({
      paymentMethodService: paymentMethodServiceGatewayMock,
    });
  });

  it('should be create a instance of the GetPaymentMethodByIdUseCase class when will be use create method.', () => {
    expect(getPaymentMethodByIdUseCase).toBeInstanceOf(
      GetPaymentMethodByIdUseCase,
    );
  });

  it('should be call execute method and return the payment method when this id are provided', async () => {
    paymentMethodServiceGatewayMock.getPaymentMethodById.mockResolvedValue({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
      description: 'Cartão de Crédito',
      descriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    });

    const result = await getPaymentMethodByIdUseCase.execute({
      id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
    });

    expect(result.data?.id).toBe('e76176ad-c2d8-4526-95cb-0440d0149dd4');
  });

  it('should be call execute method and return null when this id are provided but this payment method is not exist.', async () => {
    paymentMethodServiceGatewayMock.getPaymentMethodById.mockResolvedValue(
      null,
    );

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
      paymentMethodServiceGatewayMock.getPaymentMethodById,
    ).not.toHaveBeenCalled();
  });
});
