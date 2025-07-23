import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { GetPaymentMethodsUseCase } from './get-payment-methods.usecase';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';

let paymentMethodServiceGatewayMock: jest.Mocked<PaymentMethodServiceGateway>;

describe('Get Payment Methods', () => {
  let getPaymentMethodsUseCase: GetPaymentMethodsUseCase;

  beforeEach(() => {
    paymentMethodServiceGatewayMock = {
      getPaymentMethods: jest.fn(),
    } as any;

    getPaymentMethodsUseCase = GetPaymentMethodsUseCase.create({
      paymentMethodService: paymentMethodServiceGatewayMock,
    });
  });

  it('should be create a instance of the GetPaymentMethodsUseCase class when will be use create method.', () => {
    expect(getPaymentMethodsUseCase).toBeInstanceOf(GetPaymentMethodsUseCase);
  });

  it('should be call execute method and return the payment methods filled list with PaymentMethodDTO objects types', async () => {
    paymentMethodServiceGatewayMock.getPaymentMethods.mockResolvedValue([
      {
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
        description: 'Cartão de Crédito',
        descriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '7276fa38-39a9-4a46-983a-0aa6d1b9dc17',
        description: 'Cartão de Débito',
        descriptionEnum: PaymentMethodDescriptionEnum.DEBIT_CARD,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '5157356a-48bf-42a7-b7da-b50e21e48cfe',
        description: 'Pix',
        descriptionEnum: PaymentMethodDescriptionEnum.PIX,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: 'e6c30985-de80-4d5b-aebd-95e9eb49dc8d',
        description: 'Dinheiro',
        descriptionEnum: PaymentMethodDescriptionEnum.CASH,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
    ]);

    const result = await getPaymentMethodsUseCase.execute();

    expect(result.data.length).toEqual(4);
  });

  it('should be call execute method and return the payment methods empty list', async () => {
    paymentMethodServiceGatewayMock.getPaymentMethods.mockResolvedValue([]);

    const result = await getPaymentMethodsUseCase.execute();

    expect(result.data.length).toEqual(0);
  });
});
