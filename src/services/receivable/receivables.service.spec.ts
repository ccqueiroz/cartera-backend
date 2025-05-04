import { CacheGateway } from '@/domain/Cache/gateway/cache.gateway';
import { GenerateHashGateway } from '@/domain/Helpers/gateway/generate-hash.gateway';
import { ReceivableRepositoryGateway } from '@/domain/Receivable/gateway/receivable.repository.gateway';
import { ReceivableService } from './receivables.service';
import { SortOrder } from '@/domain/dtos/listParamsDto.dto';
import { generateHashHelper } from '@/infra/helpers';

let dbMock: jest.Mocked<ReceivableRepositoryGateway>;
let cacheMock: jest.Mocked<CacheGateway>;
let generateMock: jest.Mocked<GenerateHashGateway>;

describe('Receivable Service', () => {
  let receivableService: ReceivableService;

  const keyController = 'receivable';

  const userIdMock = '121234';

  beforeEach(() => {
    jest.clearAllMocks();

    dbMock = {
      getReceivables: jest.fn(),
      getReceivableById: jest.fn(),
      createReceivable: jest.fn(),
      updateReceivable: jest.fn(),
      deleteReceivable: jest.fn(),
    };

    cacheMock = {
      recover: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      deleteWithPattern: jest.fn(),
    } as any;

    generateMock = {
      execute: jest.fn(),
    };

    receivableService = ReceivableService.create(
      dbMock,
      cacheMock,
      generateMock,
    );
  });

  afterEach(() => {
    (ReceivableService as any).instance = undefined;
  });

  it('should be create a instance of the ReceivableService class when will be use create method', () => {
    expect(receivableService).toBeInstanceOf(ReceivableService);
  });

  it('should be call getReceivables and return the data from db', async () => {
    const data = {
      content: [
        {
          id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
          categoryId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef1',
          paymentMethodId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef2',
          paymentStatusId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef3',
          personUserId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef4',
          userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
          descriptionReceivable: 'Test Receivable 1',
          fixedReceivable: true,
          receivableDate: new Date().getTime(),
          icon: null,
          amount: 100,
          categoryDescription: 'Test Category 1',
          paymentMethodDescription: 'Test Payment Method 1',
          paymentStatusDescription: 'Paid',
          createdAt: new Date().getTime(),
          receivalDate: null,
          receival: false,
          updatedAt: null,
        },
        {
          id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
          categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
          paymentMethodId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef2',
          paymentStatusId: 'b2c3d4e5-f6a1-8901-2345-67890abcde15',
          personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
          userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
          descriptionReceivable: 'Test Receivable 2',
          fixedReceivable: false,
          receivableDate: new Date().getTime(),
          icon: null,
          amount: 200,
          categoryDescription: 'Test Category 2',
          paymentMethodDescription: 'Test Payment Method 1',
          paymentStatusDescription: 'Pending',
          createdAt: new Date().getTime(),
          receivalDate: null,
          receival: false,
          updatedAt: null,
        },
      ],
      totalElements: 2,
      totalPages: 1,
      page: 0,
      size: 10,
      ordering: null,
    };

    const input = {
      size: 10,
      page: 0,
      sort: { categoryId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef1' },
      ordering: { amount: SortOrder.DESC },
      sortByReceivables: {
        amount: 12000,
        fixedReceivable: true,
        receival: true,
      },
      searchByDate: {
        receivableDate: {
          exactlyDate: new Date().getTime(),
        },
      },
      userId: userIdMock,
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getReceivables.mockResolvedValue(data);
    const generateHashFromInput = generateHashHelper.execute(input);
    generateMock.execute.mockReturnValue(generateHashFromInput);

    const key = `${input.userId}:${keyController}-list-all-${generateHashFromInput}`;

    const result = await receivableService.getReceivables(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getReceivables).toHaveBeenCalled();
    expect(dbMock.getReceivables).toHaveBeenCalledWith(input);
    expect(cacheMock.save).toHaveBeenCalled();
    expect(result.content.length).toEqual(2);
  });

  it('should be call getReceivables and return the data from cache provider', async () => {
    const data = {
      content: [
        {
          categoryId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef1',
          paymentMethodId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef2',
          paymentStatusId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef3',
          personUserId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef4',
          userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
          descriptionReceivable: 'Test Receivable 1',
          fixedReceivable: true,
          receivableDate: new Date().getTime(),
          icon: null,
          amount: 100,
          categoryDescription: 'Test Category 1',
          paymentMethodDescription: 'Test Payment Method 1',
          paymentStatusDescription: 'Paid',
          createdAt: new Date().getTime(),
          receivalDate: null,
          receival: false,
          updatedAt: null,
        },
        {
          id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
          categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
          paymentMethodId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef2',
          paymentStatusId: 'b2c3d4e5-f6a1-8901-2345-67890abcde15',
          personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
          userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
          descriptionReceivable: 'Test Receivable 2',
          fixedReceivable: false,
          receivableDate: new Date().getTime(),
          icon: null,
          amount: 200,
          categoryDescription: 'Test Category 2',
          paymentMethodDescription: 'Test Payment Method 1',
          paymentStatusDescription: 'Pending',
          createdAt: new Date().getTime(),
          receivalDate: null,
          receival: false,
          updatedAt: null,
        },
      ],
      totalElements: 2,
      totalPages: 1,
      page: 0,
      size: 10,
      ordering: null,
    };

    const input = {
      size: 10,
      page: 0,
      sort: { categoryId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef1' },
      ordering: { amount: SortOrder.DESC },
      sortByReceivables: {
        amount: 12000,
        fixedReceivable: true,
        receival: true,
      },
      searchByDate: {
        receivableDate: {
          exactlyDate: new Date().getTime(),
        },
      },
      userId: userIdMock,
    };

    cacheMock.recover.mockResolvedValue(data);
    const generateHashFromInput = generateHashHelper.execute(input);
    generateMock.execute.mockReturnValue(generateHashFromInput);

    const key = `${input.userId}:${keyController}-list-all-${generateHashFromInput}`;

    const result = await receivableService.getReceivables(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getReceivables).not.toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result.content.length).toEqual(2);
  });

  it('should be call getReceivables and mustnt be not call the save method of the cache provider when the content attribute of the repository data response to be empty list', async () => {
    const data = {
      content: [],
      totalElements: 0,
      totalPages: 1,
      page: 0,
      size: 10,
      ordering: null,
    };

    const input = {
      size: 10,
      page: 0,
      sort: { categoryId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef1' },
      ordering: { amount: SortOrder.DESC },
      sortByReceivables: {
        amount: 12000,
        fixedReceivable: true,
        receival: true,
      },
      searchByDate: {
        receivableDate: {
          exactlyDate: new Date().getTime(),
        },
      },
      userId: userIdMock,
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getReceivables.mockResolvedValue(data);
    const generateHashFromInput = generateHashHelper.execute(input);
    generateMock.execute.mockReturnValue(generateHashFromInput);

    const key = `${input.userId}:${keyController}-list-all-${generateHashFromInput}`;

    const result = await receivableService.getReceivables(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getReceivables).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result.content.length).toEqual(0);
  });

  it('should be call getReceivables and must be call the db repository when the content attribute of the cache repository return empty list', async () => {
    const data = {
      content: [],
      totalElements: 0,
      totalPages: 1,
      page: 0,
      size: 10,
      ordering: null,
    };

    const input = {
      size: 10,
      page: 0,
      sort: { categoryId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef1' },
      ordering: { amount: SortOrder.DESC },
      sortByReceivables: {
        amount: 12000,
        fixedReceivable: true,
        receival: true,
      },
      searchByDate: {
        receivableDate: {
          exactlyDate: new Date().getTime(),
        },
      },
      userId: userIdMock,
    };

    cacheMock.recover.mockResolvedValue(data);
    dbMock.getReceivables.mockResolvedValue(data);
    const generateHashFromInput = generateHashHelper.execute(input);
    generateMock.execute.mockReturnValue(generateHashFromInput);

    const key = `${input.userId}:${keyController}-list-all-${generateHashFromInput}`;

    const result = await receivableService.getReceivables(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getReceivables).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result.content.length).toEqual(0);
  });

  it('should be call getReceivableById and return the data from db', async () => {
    const data = {
      id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      paymentMethodId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef2',
      paymentStatusId: 'b2c3d4e5-f6a1-8901-2345-67890abcde15',
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      icon: null,
      amount: 200,
      categoryDescription: 'Test Category 2',
      paymentMethodDescription: 'Test Payment Method 1',
      paymentStatusDescription: 'Pending',
      createdAt: new Date().getTime(),
      receivalDate: null,
      receival: false,
      updatedAt: null,
    };

    const input = {
      id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
      userId: userIdMock,
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getReceivableById.mockResolvedValue(data);

    const key = `${input.userId}:${keyController}-list-by-id-${data.id}`;

    const result = await receivableService.getReceivableById(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getReceivableById).toHaveBeenCalled();
    expect(cacheMock.save).toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it('should be call getReceivableById and return the data from cache provider', async () => {
    const data = {
      id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      paymentMethodId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef2',
      paymentStatusId: 'b2c3d4e5-f6a1-8901-2345-67890abcde15',
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      icon: null,
      amount: 200,
      categoryDescription: 'Test Category 2',
      paymentMethodDescription: 'Test Payment Method 1',
      paymentStatusDescription: 'Pending',
      createdAt: new Date().getTime(),
      receivalDate: null,
      receival: false,
      updatedAt: null,
    };

    const input = {
      id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
      userId: userIdMock,
    };

    cacheMock.recover.mockResolvedValue(data);

    const key = `${input.userId}:${keyController}-list-by-id-${data.id}`;

    const result = await receivableService.getReceivableById(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getReceivableById).not.toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it('should be call getReceivableById and mustnt be not call the save method of the cache provider when the data response to be null', async () => {
    const data = null;

    const input = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      userId: userIdMock,
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getReceivableById.mockResolvedValue(data);

    const key = `${input.userId}:${keyController}-list-by-id-${input.id}`;

    const result = await receivableService.getReceivableById(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getReceivableById).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should be call getReceivableById and must be call the db repository when data response of the cache repository return null', async () => {
    const data = null;

    const input = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      userId: userIdMock,
    };

    cacheMock.recover.mockResolvedValue(data);
    dbMock.getReceivableById.mockResolvedValue(data);

    const key = `${input.userId}:${keyController}-list-by-id-${input.id}`;

    const result = await receivableService.getReceivableById(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getReceivableById).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should be call method createReceivable from db provider and after response this provider, must delete the all stored keys that represent list-all from cache provider', async () => {
    const data = {
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      paymentMethodId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef2',
      paymentStatusId: 'b2c3d4e5-f6a1-8901-2345-67890abcde15',
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      icon: null,
      amount: 200,
      categoryDescription: 'Test Category 2',
      paymentMethodDescription: 'Test Payment Method 1',
      paymentStatusDescription: 'Pending',
      createdAt: new Date().getTime(),
      receivalDate: null,
      receival: false,
      updatedAt: null,
    };

    const responseData = {
      id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
    };

    dbMock.createReceivable.mockResolvedValue(responseData);

    const result = await receivableService.createReceivable({
      userId: userIdMock,
      receivableData: data,
    });

    const patternKeysToDelete = `${userIdMock}:${keyController}-list-all`;

    expect(dbMock.createReceivable).toHaveBeenCalled();
    expect(dbMock.createReceivable).toHaveBeenCalledWith({
      userId: userIdMock,
      receivableData: data,
    });
    expect(cacheMock.deleteWithPattern).toHaveBeenCalled();
    expect(cacheMock.deleteWithPattern).toHaveBeenCalledWith(
      patternKeysToDelete,
    );
    expect(result?.id).toEqual(responseData.id);
  });

  it('should be call method createReceivable from db provider and after response failed, mustnt call deleteWithPattern from cache provider.', async () => {
    const data = {
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      paymentMethodId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef2',
      paymentStatusId: 'b2c3d4e5-f6a1-8901-2345-67890abcde15',
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      icon: null,
      amount: 200,
      categoryDescription: 'Test Category 2',
      paymentMethodDescription: 'Test Payment Method 1',
      paymentStatusDescription: 'Pending',
      createdAt: new Date().getTime(),
      receivalDate: null,
      receival: false,
      updatedAt: null,
    };

    const responseData = {
      id: undefined as any,
    };

    dbMock.createReceivable.mockResolvedValue(responseData);

    await receivableService.createReceivable({
      userId: userIdMock,
      receivableData: data,
    });

    expect(dbMock.createReceivable).toHaveBeenCalled();
    expect(dbMock.createReceivable).toHaveBeenCalledWith({
      userId: userIdMock,
      receivableData: data,
    });
    expect(cacheMock.deleteWithPattern).not.toHaveBeenCalled();
  });

  it('should be call method updateReceivable from db provider and after response this provider, must delete the all stored keys that represent list-all from cache provider and find the data from key in cache and data replace.', async () => {
    const data = {
      id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
      categoryId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef1',
      paymentMethodId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef2',
      paymentStatusId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef3',
      personUserId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef4',
      userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
      descriptionReceivable: 'Test Receivable 1',
      fixedReceivable: true,
      receivableDate: new Date().getTime(),
      icon: null,
      amount: 100,
      categoryDescription: 'Test Category 1',
      paymentMethodDescription: 'Test Payment Method 1',
      paymentStatusDescription: 'Paid',
      createdAt: new Date().getTime(),
      receivalDate: null,
      receival: false,
      updatedAt: new Date().getTime(),
    };

    dbMock.updateReceivable.mockResolvedValue(data);

    const result = await receivableService.updateReceivable({
      userId: userIdMock,
      receivableData: data,
      receivableId: data.id,
    });

    const patternKeysToDelete = `${userIdMock}:${keyController}-list-all`;

    const keyToDataReplace = `${userIdMock}:${keyController}-list-by-id-${data.id}`;

    expect(dbMock.updateReceivable).toHaveBeenCalled();
    expect(dbMock.updateReceivable).toHaveBeenCalledWith({
      userId: userIdMock,
      receivableData: data,
      receivableId: data.id,
    });
    expect(cacheMock.deleteWithPattern).toHaveBeenCalled();
    expect(cacheMock.deleteWithPattern).toHaveBeenCalledWith(
      patternKeysToDelete,
    );
    expect(cacheMock.save).toHaveBeenCalled();
    expect(cacheMock.save).toHaveBeenCalledWith(keyToDataReplace, data, 240);
    expect(result).not.toBeNull();
  });

  it('should be call method updateBill from db provider and after response failed, mustnt call deleteWithPattern from cache provider and save this data.', async () => {
    const data = {
      id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
      categoryId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef1',
      paymentMethodId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef2',
      paymentStatusId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef3',
      personUserId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef4',
      userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
      descriptionReceivable: 'Test Receivable 1',
      fixedReceivable: true,
      receivableDate: new Date().getTime(),
      icon: null,
      amount: 100,
      categoryDescription: 'Test Category 1',
      paymentMethodDescription: 'Test Payment Method 1',
      paymentStatusDescription: 'Paid',
      createdAt: new Date().getTime(),
      receivalDate: null,
      receival: false,
      updatedAt: new Date().getTime(),
    };

    dbMock.updateReceivable.mockResolvedValue(undefined as any);

    const result = await receivableService.updateReceivable({
      userId: userIdMock,
      receivableData: data,
      receivableId: data.id,
    });

    expect(dbMock.updateReceivable).toHaveBeenCalled();
    expect(dbMock.updateReceivable).toHaveBeenCalledWith({
      userId: userIdMock,
      receivableData: data,
      receivableId: data.id,
    });
    expect(cacheMock.deleteWithPattern).not.toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it('should be call method deleteReceivable from db provider and after response this provider, must delete the all stored keys that represent list-all from cache provider', async () => {
    const patternKeysToDelete = `${userIdMock}:${keyController}`;

    await receivableService.deleteReceivable({
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      userId: userIdMock,
    });

    expect(dbMock.deleteReceivable).toHaveBeenCalled();
    expect(dbMock.deleteReceivable).toHaveBeenCalledWith({
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      userId: userIdMock,
    });
    expect(cacheMock.deleteWithPattern).toHaveBeenCalled();
    expect(cacheMock.deleteWithPattern).toHaveBeenCalledWith(
      patternKeysToDelete,
    );
  });
});
