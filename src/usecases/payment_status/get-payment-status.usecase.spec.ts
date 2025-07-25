import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';
import { GetPaymentStatusUseCase } from './get-payment-status.usecase';
import { PaymentStatusServiceGateway } from '@/domain/Payment_Status/gateway/payment-status.service.gateway';

let paymentStatusServiceGatewayMock: jest.Mocked<PaymentStatusServiceGateway>;

describe('Get Payment Status', () => {
  let getPaymentStatusUseCase: GetPaymentStatusUseCase;

  beforeEach(() => {
    paymentStatusServiceGatewayMock = {
      getPaymentStatus: jest.fn(),
    } as any;

    getPaymentStatusUseCase = GetPaymentStatusUseCase.create({
      paymentStatusService: paymentStatusServiceGatewayMock,
    });
  });

  it('should be create a instance of the GetPaymentStatusUseCase clas when will be use create method.', () => {
    expect(getPaymentStatusUseCase).toBeInstanceOf(GetPaymentStatusUseCase);
  });

  it('should be call execute method and return the payment status filled list with PaymentStatusDTO objects types', async () => {
    paymentStatusServiceGatewayMock.getPaymentStatus.mockResolvedValue([
      {
        id: '0e8f775d-07c1-4ca1-abea-57157ff173b0',
        description: 'Pago',
        descriptionEnum: PaymentStatusDescriptionEnum.PAID,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '17de6833-1e75-40d3-afc3-3249c4da184f',
        description: 'A Pagar',
        descriptionEnum: PaymentStatusDescriptionEnum.TO_PAY,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '1902e085-8c3d-4d0b-aee1-9f7db1e5ec52',
        description: 'A receber',
        descriptionEnum: PaymentStatusDescriptionEnum.TO_RECEIVE,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '2b8c9278-f5c6-439d-995e-20d30c2871a5',
        description: 'Recebido',
        descriptionEnum: PaymentStatusDescriptionEnum.RECEIVED,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
    ]);

    const result = await getPaymentStatusUseCase.execute();

    expect(result.data.length).toEqual(4);
  });

  it('should be call execute method and return the payment status empty list', async () => {
    paymentStatusServiceGatewayMock.getPaymentStatus.mockResolvedValue([]);

    const result = await getPaymentStatusUseCase.execute();

    expect(result.data.length).toEqual(0);
  });
});
