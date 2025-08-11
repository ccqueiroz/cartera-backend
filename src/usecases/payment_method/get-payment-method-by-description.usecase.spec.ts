import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';
import { GetPaymentMethodByDescriptionUseCase } from './get-payment-method-by-description.usecase';

let paymentMethodServiceGatewayMock: jest.Mocked<PaymentMethodServiceGateway>;

describe('Get Payment Method By Description Enum', () => {
  let getPaymentMethodByDescriptionUseCase: GetPaymentMethodByDescriptionUseCase;

  beforeEach(() => {
    paymentMethodServiceGatewayMock = {
      getPaymentMethodByDescriptionEnum: jest.fn(),
    } as any;

    getPaymentMethodByDescriptionUseCase =
      GetPaymentMethodByDescriptionUseCase.create({
        paymentMethodService: paymentMethodServiceGatewayMock,
      });
  });

  it('should be create a instance of the GetPaymentMethodByDescriptionUseCase class when will be use create method.', () => {
    expect(getPaymentMethodByDescriptionUseCase).toBeInstanceOf(
      GetPaymentMethodByDescriptionUseCase,
    );
  });

  it('should be call execute method and return the payment method when this descriptionEnum are provided', async () => {
    paymentMethodServiceGatewayMock.getPaymentMethodByDescriptionEnum.mockResolvedValue(
      {
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
        description: 'Cartão de Crédito',
        descriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
    );

    const result = await getPaymentMethodByDescriptionUseCase.execute({
      descriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
    });

    expect(result.data?.id).toBe('e76176ad-c2d8-4526-95cb-0440d0149dd4');
  });

  it('should be call execute method and null when this descriptionEnum are provided but dont exist in the base.', async () => {
    paymentMethodServiceGatewayMock.getPaymentMethodByDescriptionEnum.mockResolvedValue(
      null,
    );

    const result = await getPaymentMethodByDescriptionUseCase.execute({
      descriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
    });

    expect(result.data).toBeNull();
  });

  it('should call execute method when descriptionEnum not provided', async () => {
    const error = await getPaymentMethodByDescriptionUseCase
      .execute({
        descriptionEnum: '' as any,
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });

    expect(
      paymentMethodServiceGatewayMock.getPaymentMethodByDescriptionEnum,
    ).not.toHaveBeenCalled();
  });
});
