import { PaymentMethodGateway } from '@/domain/Payment_Method/gateway/payment-method.gateway';
import { GetPaymentMethodsUseCase } from './get-payment-methods.usecase';

let paymentMethodUserGatewayMock: jest.Mocked<PaymentMethodGateway>;

describe('Get Payment Methods', () => {
  let getPaymentMethodsUseCase: GetPaymentMethodsUseCase;

  beforeEach(() => {
    paymentMethodUserGatewayMock = {
      getPaymentMethods: jest.fn(),
      getPaymentMethodById: jest.fn(),
    };

    getPaymentMethodsUseCase = GetPaymentMethodsUseCase.create({
      paymentMethodGateway: paymentMethodUserGatewayMock,
    });
  });

  it('should be create a instance of the GetPaymentMethodsUseCase class when will be use create method.', () => {
    expect(getPaymentMethodsUseCase).toBeInstanceOf(GetPaymentMethodsUseCase);
  });

  it('should be call execute method and return the payment methods filled list with PaymentMethodDTO objects types', async () => {
    paymentMethodUserGatewayMock.getPaymentMethods.mockResolvedValue([
      {
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
        description: 'Cartão de crédito',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '7276fa38-39a9-4a46-983a-0aa6d1b9dc17',
        description: 'Cartão de débito',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5157356a-48bf-42a7-b7da-b50e21e48cfe',
        description: 'Pix',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'e6c30985-de80-4d5b-aebd-95e9eb49dc8d',
        description: 'Dinheiro',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    const result = await getPaymentMethodsUseCase.execute();

    expect(result.data.length).toEqual(4);
  });

  it('should be call execute method and return the payment methods empty list', async () => {
    paymentMethodUserGatewayMock.getPaymentMethods.mockResolvedValue([]);

    const result = await getPaymentMethodsUseCase.execute();

    expect(result.data.length).toEqual(0);
  });
});
