import { CacheGateway } from '@/domain/Cache/gateway/cache.gateway';
import { PaymentStatusService } from './payment-status.service';
import { PaymentStatusRepositoryGateway } from '@/domain/Payment_Status/gateway/payment-status.respository.gateway';
import { PaymentStatusDTO } from '@/domain/Payment_Status/dtos/payment-status.dto';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';

let dbMock: jest.Mocked<PaymentStatusRepositoryGateway>;
let cacheMock: jest.Mocked<CacheGateway>;

describe('Payment Status Service', () => {
  let paymentStatusService: PaymentStatusService;

  const keyController = 'payment-status';

  beforeEach(() => {
    jest.clearAllMocks();

    dbMock = {
      getPaymentStatus: jest.fn(),
      getPaymentStatusById: jest.fn(),
    };

    cacheMock = {
      recover: jest.fn(),
      save: jest.fn(),
    } as any;

    paymentStatusService = PaymentStatusService.create(dbMock, cacheMock);
  });

  afterEach(() => {
    (PaymentStatusService as any).instance = undefined;
  });

  it('should be create a instance of the PaymentStatusService class when will be use create Status', () => {
    expect(paymentStatusService).toBeInstanceOf(PaymentStatusService);
  });

  it('should be a verify singleton', () => {
    const newInstanceService = PaymentStatusService.create(dbMock, cacheMock);

    expect(paymentStatusService).toEqual(newInstanceService);
  });

  it('should be call getPaymentStatus and return the data from db', async () => {
    const data = [
      {
        id: '0e8f775d-07c1-4ca1-abea-57157ff173b0',
        description: 'Pago',
        descriptionEnum: PaymentStatusDescriptionEnum.PAID,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '17de6833-1e75-40d3-afc3-3249c4da184f',
        description: 'A pagar',
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
    ];

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getPaymentStatus.mockResolvedValue(data);

    const key = `${keyController}-list-all`;

    const result = await paymentStatusService.getPaymentStatus();

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(cacheMock.save).toHaveBeenCalled();
    expect(cacheMock.save).toHaveBeenCalledWith(key, data, 600);
    expect(dbMock.getPaymentStatus).toHaveBeenCalled();
    expect(dbMock.getPaymentStatus).toHaveBeenCalledWith();
    expect(result.length).toEqual(3);
  });

  it('should be call getPaymentStatus and return the data from cache', async () => {
    const data = [
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
    ];

    cacheMock.recover.mockResolvedValue(data);

    const key = `${keyController}-list-all`;

    const result = await paymentStatusService.getPaymentStatus();

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(dbMock.getPaymentStatus).not.toHaveBeenCalled();
    expect(result.length).toEqual(3);
  });

  it('should be not call the "save" Status of the cache provider when dont exist registered key in this provider and the data are provided from db provider and the this are empty list', async () => {
    const data: Array<PaymentStatusDTO> = [];

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getPaymentStatus.mockResolvedValue(data);

    const key = `${keyController}-list-all`;

    const result = await paymentStatusService.getPaymentStatus();

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getPaymentStatus).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result.length).toEqual(0);
  });

  it('should be call getPaymentStatusById and return the data from db', async () => {
    const data: PaymentStatusDTO = {
      id: '1902e085-8c3d-4d0b-aee1-9f7db1e5ec52',
      description: 'A receber',
      descriptionEnum: PaymentStatusDescriptionEnum.TO_RECEIVE,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getPaymentStatusById.mockResolvedValue(data);

    const key = `${keyController}-list-by-id-${data.id}`;

    const result = await paymentStatusService.getPaymentStatusById({
      id: data.id,
    });

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getPaymentStatusById).toHaveBeenCalled();
    expect(dbMock.getPaymentStatusById).toHaveBeenCalledWith({ id: data.id });
    expect(cacheMock.save).toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it('should be call getPaymentStatusById and return the data from cache', async () => {
    const data: PaymentStatusDTO = {
      id: '1902e085-8c3d-4d0b-aee1-9f7db1e5ec52',
      description: 'A receber',
      descriptionEnum: PaymentStatusDescriptionEnum.TO_RECEIVE,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    cacheMock.recover.mockResolvedValue(data);

    const key = `${keyController}-list-by-id-${data.id}`;

    const result = await paymentStatusService.getPaymentStatusById({
      id: data.id,
    });

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getPaymentStatusById).not.toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it('should be not call the "save" Status of the cache provider when dont exist registered key in this provider and the data are provided from db provider and the this are null', async () => {
    const data: PaymentStatusDTO = {
      id: '1902e085-8c3d-4d0b-aee1-9f7db1e5ec52',
      description: 'A receber',
      descriptionEnum: PaymentStatusDescriptionEnum.TO_RECEIVE,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getPaymentStatusById.mockResolvedValue(null);

    const key = `${keyController}-list-by-id-${data.id}`;

    const result = await paymentStatusService.getPaymentStatusById({
      id: data.id,
    });

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getPaymentStatusById).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
