import { PaymentStatusGateway } from '@/domain/Payment_Status/gateway/payment-status.gateway';
import { GetPaymentStatusUseCase } from './get-payment-status.usecase';

let paymentStatusUserGatewayMock: jest.Mocked<PaymentStatusGateway>;

describe('Get Payment Status', () => {
  let getPaymentStatusUseCase: GetPaymentStatusUseCase;

  beforeEach(() => {
    paymentStatusUserGatewayMock = {
      getPaymentStatus: jest.fn(),
      getPaymentStatusById: jest.fn(),
    };

    getPaymentStatusUseCase = GetPaymentStatusUseCase.create({
      paymentStatusGateway: paymentStatusUserGatewayMock,
    });
  });

  it('should be create a instance of the GetPaymentStatusUseCase clas when will be use create method.', () => {
    expect(getPaymentStatusUseCase).toBeInstanceOf(GetPaymentStatusUseCase);
  });

  it('should be call execute method and return the payment status filled list with PaymentStatusDTO objects types', async () => {
    paymentStatusUserGatewayMock.getPaymentStatus.mockResolvedValue([
      {
        id: '0e8f775d-07c1-4ca1-abea-57157ff173b0',
        description: 'Pago',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '17de6833-1e75-40d3-afc3-3249c4da184f',
        description: 'A pagar',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '1902e085-8c3d-4d0b-aee1-9f7db1e5ec52',
        description: 'A receber',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '2b8c9278-f5c6-439d-995e-20d30c2871a5',
        description: 'Recebido',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
    ]);

    const result = await getPaymentStatusUseCase.execute();

    expect(result.data.length).toEqual(4);
  });

  it('should be call execute method and return the payment status empty list', async () => {
    paymentStatusUserGatewayMock.getPaymentStatus.mockResolvedValue([]);

    const result = await getPaymentStatusUseCase.execute();

    expect(result.data.length).toEqual(0);
  });
});
