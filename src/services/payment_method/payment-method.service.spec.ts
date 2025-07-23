import { CacheGateway } from '@/domain/Cache/gateway/cache.gateway';
import { PaymentMethodRepositoryGateway } from '@/domain/Payment_Method/gateway/payment-method.repository.gateway';
import { PaymentMethodService } from './payment-method.service';
import { PaymentMethodDTO } from '@/domain/Payment_Method/dtos/payment-method.dto';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';

let dbMock: jest.Mocked<PaymentMethodRepositoryGateway>;
let cacheMock: jest.Mocked<CacheGateway>;

describe('Payment Method Service', () => {
  let paymentMethodService: PaymentMethodService;

  const keyController = 'payment-method';

  beforeEach(() => {
    jest.clearAllMocks();

    dbMock = {
      getPaymentMethods: jest.fn(),
      getPaymentMethodById: jest.fn(),
    };

    cacheMock = {
      recover: jest.fn(),
      save: jest.fn(),
    } as any;

    paymentMethodService = PaymentMethodService.create(dbMock, cacheMock);
  });

  afterEach(() => {
    (PaymentMethodService as any).instance = undefined;
  });

  it('should be create a instance of the PaymentMethodService class when will be use create method', () => {
    expect(paymentMethodService).toBeInstanceOf(PaymentMethodService);
  });

  it('should be a verify singleton', () => {
    const newInstanceService = PaymentMethodService.create(dbMock, cacheMock);

    expect(paymentMethodService).toEqual(newInstanceService);
  });

  it('should be call getPaymentMethods and return the data from db', async () => {
    const data = [
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
    ];

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getPaymentMethods.mockResolvedValue(data);

    const key = `${keyController}-list-all`;

    const result = await paymentMethodService.getPaymentMethods();

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(cacheMock.save).toHaveBeenCalled();
    expect(cacheMock.save).toHaveBeenCalledWith(key, data, 600);
    expect(dbMock.getPaymentMethods).toHaveBeenCalled();
    expect(dbMock.getPaymentMethods).toHaveBeenCalledWith();
    expect(result.length).toEqual(3);
  });

  it('should be call getPaymentMethods and return the data from cache', async () => {
    const data = [
      {
        id: 'e76176ad-c2d8-4526-95cb-0440d0149dd4',
        description: 'Cartão de crédito',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '7276fa38-39a9-4a46-983a-0aa6d1b9dc17',
        description: 'Cartão de débito',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
      {
        id: '5157356a-48bf-42a7-b7da-b50e21e48cfe',
        description: 'Pix',
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      },
    ];

    cacheMock.recover.mockResolvedValue(data);

    const key = `${keyController}-list-all`;

    const result = await paymentMethodService.getPaymentMethods();

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(dbMock.getPaymentMethods).not.toHaveBeenCalled();
    expect(result.length).toEqual(3);
  });

  it('should be not call the "save" method of the cache provider when dont exist registered key in this provider and the data are provided from db provider and the this are empty list', async () => {
    const data: Array<PaymentMethodDTO> = [];

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getPaymentMethods.mockResolvedValue(data);

    const key = `${keyController}-list-all`;

    const result = await paymentMethodService.getPaymentMethods();

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getPaymentMethods).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result.length).toEqual(0);
  });

  it('should be call getPaymentMethodById and return the data from db', async () => {
    const data: PaymentMethodDTO = {
      id: '5157356a-48bf-42a7-b7da-b50e21e48cfe',
      description: 'Pix',
      descriptionEnum: PaymentMethodDescriptionEnum.PIX,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getPaymentMethodById.mockResolvedValue(data);

    const key = `${keyController}-list-by-id-${data.id}`;

    const result = await paymentMethodService.getPaymentMethodById({
      id: data.id,
    });

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getPaymentMethodById).toHaveBeenCalled();
    expect(dbMock.getPaymentMethodById).toHaveBeenCalledWith({ id: data.id });
    expect(cacheMock.save).toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it('should be call getPaymentMethodById and return the data from cache', async () => {
    const data: PaymentMethodDTO = {
      id: '5157356a-48bf-42a7-b7da-b50e21e48cfe',
      description: 'Pix',
      descriptionEnum: PaymentMethodDescriptionEnum.PIX,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    cacheMock.recover.mockResolvedValue(data);

    const key = `${keyController}-list-by-id-${data.id}`;

    const result = await paymentMethodService.getPaymentMethodById({
      id: data.id,
    });

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getPaymentMethodById).not.toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it('should be not call the "save" method of the cache provider when dont exist registered key in this provider and the data are provided from db provider and the this are null', async () => {
    const data: PaymentMethodDTO = {
      id: '5157356a-48bf-42a7-b7da-b50e21e48cfe',
      description: 'Pix',
      descriptionEnum: PaymentMethodDescriptionEnum.PIX,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getPaymentMethodById.mockResolvedValue(null);

    const key = `${keyController}-list-by-id-${data.id}`;

    const result = await paymentMethodService.getPaymentMethodById({
      id: data.id,
    });

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getPaymentMethodById).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
