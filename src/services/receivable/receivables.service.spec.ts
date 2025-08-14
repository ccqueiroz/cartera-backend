import { CacheGateway } from '@/domain/Cache/gateway/cache.gateway';
import { GenerateHashGateway } from '@/domain/Helpers/gateway/generate-hash.gateway';
import { ReceivableRepositoryGateway } from '@/domain/Receivable/gateway/receivable.repository.gateway';
import { ReceivableService } from './receivables.service';
import { SortOrder } from '@/domain/dtos/listParamsDto.dto';
import { generateHashHelper } from '@/infra/helpers';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';

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
      receivablesByMonth: jest.fn(),
      totalAmountReceivables: jest.fn(),
      handleQueryReceivablesByFilters: jest.fn(),
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
          personUserId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef4',
          userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
          descriptionReceivable: 'Test Receivable 1',
          fixedReceivable: true,
          receivableDate: new Date().getTime(),
          receivalDate: null,
          receival: false,
          icon: null,
          amount: 100,
          categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
          categoryDescription: 'Comissões e Bonificações',
          categoryDescriptionEnum: CategoryDescriptionEnum.REIMBURSEMENTS,
          categoryGroup: CategoryGroupEnum.REVENUES,
          paymentStatus: PaymentStatusDescriptionEnum.DUE_DAY,
          createdAt: new Date().getTime(),
          updatedAt: null,
        },
        {
          id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
          personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
          userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
          descriptionReceivable: 'Test Receivable 2',
          fixedReceivable: false,
          receivableDate: new Date().getTime(),
          receivalDate: new Date().getTime(),
          receival: true,
          icon: null,
          amount: 200,
          categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
          categoryDescription: 'Aluguéis e Rendimentos de Ativos',
          categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
          categoryGroup: CategoryGroupEnum.REVENUES,
          paymentMethodDescription: 'Pix',
          paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
          paymentStatus: PaymentStatusDescriptionEnum.PAID,
          createdAt: new Date().getTime(),
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
      sort: { category: CategoryDescriptionEnum.RENT_INCOME },
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
          personUserId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef4',
          userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
          descriptionReceivable: 'Test Receivable 1',
          fixedReceivable: true,
          receivableDate: new Date().getTime(),
          receivalDate: null,
          receival: false,
          icon: null,
          amount: 100,
          categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
          categoryDescription: 'Comissões e Bonificações',
          categoryDescriptionEnum: CategoryDescriptionEnum.REIMBURSEMENTS,
          categoryGroup: CategoryGroupEnum.REVENUES,
          paymentStatus: PaymentStatusDescriptionEnum.DUE_DAY,
          createdAt: new Date().getTime(),
          updatedAt: null,
        },
        {
          id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
          personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
          userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
          descriptionReceivable: 'Test Receivable 2',
          fixedReceivable: false,
          receivableDate: new Date().getTime(),
          receivalDate: new Date().getTime(),
          receival: true,
          icon: null,
          amount: 200,
          categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
          categoryDescription: 'Aluguéis e Rendimentos de Ativos',
          categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
          categoryGroup: CategoryGroupEnum.REVENUES,
          paymentMethodDescription: 'Pix',
          paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
          paymentStatus: PaymentStatusDescriptionEnum.PAID,
          createdAt: new Date().getTime(),
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
      sort: { category: CategoryDescriptionEnum.RENT_INCOME },
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
      sort: { category: CategoryDescriptionEnum.RENT_INCOME },
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
      sort: { category: CategoryDescriptionEnum.RENT_INCOME },
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
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      paymentMethodDescription: 'Pix',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
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
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      paymentMethodDescription: 'Pix',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
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
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      paymentMethodDescription: 'Pix',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      createdAt: new Date().getTime(),
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

    const patternKeysToDelete = `${userIdMock}:${keyController}-list*`;

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
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      paymentMethodDescription: 'Pix',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      createdAt: new Date().getTime(),
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
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      paymentMethodDescription: 'Pix',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    dbMock.updateReceivable.mockResolvedValue(data);

    const result = await receivableService.updateReceivable({
      userId: userIdMock,
      receivableData: data,
      receivableId: data.id,
    });

    const patternKeysToDelete = `${userIdMock}:${keyController}-list*`;

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
      personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
      userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
      descriptionReceivable: 'Test Receivable 2',
      fixedReceivable: false,
      receivableDate: new Date().getTime(),
      receivalDate: new Date().getTime(),
      receival: true,
      icon: null,
      amount: 200,
      categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
      categoryDescription: 'Aluguéis e Rendimentos de Ativos',
      categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
      categoryGroup: CategoryGroupEnum.REVENUES,
      paymentMethodDescription: 'Pix',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      createdAt: new Date().getTime(),
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
    const patternKeysToDelete = `${userIdMock}:${keyController}*`;

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

  it('should be call receivablesByMonth and return the data from cache provider', async () => {
    const data = {
      content: [
        {
          personUserId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef4',
          userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
          descriptionReceivable: 'Test Receivable 1',
          fixedReceivable: true,
          receivableDate: new Date().getTime(),
          receivalDate: null,
          receival: false,
          icon: null,
          amount: 100,
          categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
          categoryDescription: 'Comissões e Bonificações',
          categoryDescriptionEnum: CategoryDescriptionEnum.REIMBURSEMENTS,
          categoryGroup: CategoryGroupEnum.REVENUES,
          paymentStatus: PaymentStatusDescriptionEnum.DUE_DAY,
          createdAt: new Date().getTime(),
          updatedAt: null,
        },
        {
          id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
          personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
          userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
          descriptionReceivable: 'Test Receivable 2',
          fixedReceivable: false,
          receivableDate: new Date().getTime(),
          receivalDate: new Date().getTime(),
          receival: true,
          icon: null,
          amount: 200,
          categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
          categoryDescription: 'Aluguéis e Rendimentos de Ativos',
          categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
          categoryGroup: CategoryGroupEnum.REVENUES,
          paymentMethodDescription: 'Pix',
          paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
          paymentStatus: PaymentStatusDescriptionEnum.PAID,
          createdAt: new Date().getTime(),
          updatedAt: null,
        },
      ],
      page: 0,
      size: 10,
      totalElements: 2,
      totalPages: 1,
      ordering: null,
    };

    const input = {
      period: {
        initialDate: new Date('2025, 02, 01').getTime(),
        finalDate: new Date('2025, 05, 01').getTime(),
      },
      userId: userIdMock,
      page: 0,
      size: 10,
    };

    cacheMock.recover.mockResolvedValue(data);

    const key = `${input.userId}:${keyController}-list-by-receivables-by-month-${input.period.initialDate}-${input.period.finalDate}-${input.page}-${input.size}`;

    const result = await receivableService.receivablesByMonth(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.receivablesByMonth).not.toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result.content.length).toEqual(2);
  });

  it('should be call receivablesByMonth and return the data from db provider', async () => {
    const data = {
      content: [
        {
          personUserId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef4',
          userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
          descriptionReceivable: 'Test Receivable 1',
          fixedReceivable: true,
          receivableDate: new Date().getTime(),
          receivalDate: null,
          receival: false,
          icon: null,
          amount: 100,
          categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
          categoryDescription: 'Comissões e Bonificações',
          categoryDescriptionEnum: CategoryDescriptionEnum.REIMBURSEMENTS,
          categoryGroup: CategoryGroupEnum.REVENUES,
          paymentStatus: PaymentStatusDescriptionEnum.DUE_DAY,
          createdAt: new Date().getTime(),
          updatedAt: null,
        },
        {
          id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
          personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
          userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
          descriptionReceivable: 'Test Receivable 2',
          fixedReceivable: false,
          receivableDate: new Date().getTime(),
          receivalDate: new Date().getTime(),
          receival: true,
          icon: null,
          amount: 200,
          categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
          categoryDescription: 'Aluguéis e Rendimentos de Ativos',
          categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
          categoryGroup: CategoryGroupEnum.REVENUES,
          paymentMethodDescription: 'Pix',
          paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
          paymentStatus: PaymentStatusDescriptionEnum.PAID,
          createdAt: new Date().getTime(),
          updatedAt: null,
        },
      ],
      page: 0,
      size: 10,
      totalElements: 2,
      totalPages: 1,
      ordering: null,
    };

    const input = {
      period: {
        initialDate: new Date('2025, 02, 01').getTime(),
        finalDate: new Date('2025, 05, 01').getTime(),
      },
      userId: userIdMock,
      page: 0,
      size: 10,
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.receivablesByMonth.mockResolvedValue(data);

    const key = `${input.userId}:${keyController}-list-by-receivables-by-month-${input.period.initialDate}-${input.period.finalDate}-${input.page}-${input.size}`;

    const result = await receivableService.receivablesByMonth(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.receivablesByMonth).toHaveBeenCalled();
    expect(cacheMock.save).toHaveBeenCalled();
    expect(result.content.length).toEqual(2);
  });

  it('should be call receivablesByMonth and mustnt be not call the save method of the cache provider when the data response from db provider to be empty list', async () => {
    const data = {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 1,
      ordering: null,
    };

    const input = {
      period: {
        initialDate: new Date('2025, 02, 01').getTime(),
        finalDate: new Date('2025, 05, 01').getTime(),
      },
      userId: userIdMock,
      page: 0,
      size: 10,
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.receivablesByMonth.mockResolvedValue(data);

    const key = `${input.userId}:${keyController}-list-by-receivables-by-month-${input.period.initialDate}-${input.period.finalDate}-${input.page}-${input.size}`;

    const result = await receivableService.receivablesByMonth(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.receivablesByMonth).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result.content.length).toEqual(0);
  });

  it('should be call receivablesByMonth and must be call the db repository when the data response of the cache repository return empty list', async () => {
    const data = {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 1,
      ordering: null,
    };

    const input = {
      period: {
        initialDate: new Date('2025, 02, 01').getTime(),
        finalDate: new Date('2025, 05, 01').getTime(),
      },
      userId: userIdMock,
      page: 0,
      size: 10,
    };

    cacheMock.recover.mockResolvedValue(data);
    dbMock.receivablesByMonth.mockResolvedValue(data);

    const key = `${input.userId}:${keyController}-list-by-receivables-by-month-${input.period.initialDate}-${input.period.finalDate}-${input.page}-${input.size}`;

    const result = await receivableService.receivablesByMonth(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.receivablesByMonth).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result.content.length).toEqual(0);
  });

  it('should be call totalAmountReceivables from db and return the total amount receivables', () => {
    const receivables = [
      {
        personUserId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef4',
        userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
        descriptionReceivable: 'Test Receivable 1',
        fixedReceivable: true,
        receivableDate: new Date().getTime(),
        receivalDate: null,
        receival: false,
        icon: null,
        amount: 100,
        categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
        categoryDescription: 'Comissões e Bonificações',
        categoryDescriptionEnum: CategoryDescriptionEnum.REIMBURSEMENTS,
        categoryGroup: CategoryGroupEnum.REVENUES,
        paymentStatus: PaymentStatusDescriptionEnum.DUE_DAY,
        createdAt: new Date().getTime(),
        updatedAt: null,
      },
      {
        id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
        personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
        userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
        descriptionReceivable: 'Test Receivable 2',
        fixedReceivable: false,
        receivableDate: new Date().getTime(),
        receivalDate: new Date().getTime(),
        receival: true,
        icon: null,
        amount: 200,
        categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
        categoryDescription: 'Aluguéis e Rendimentos de Ativos',
        categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
        categoryGroup: CategoryGroupEnum.REVENUES,
        paymentMethodDescription: 'Pix',
        paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
        paymentStatus: PaymentStatusDescriptionEnum.PAID,
        createdAt: new Date().getTime(),
        updatedAt: null,
      },
    ];

    dbMock.totalAmountReceivables.mockReturnValue(300);

    const result = receivableService.totalAmountReceivables(receivables);

    expect(dbMock.totalAmountReceivables).toHaveBeenCalled();
    expect(dbMock.totalAmountReceivables).toHaveBeenCalledWith(receivables);
    expect(result).toEqual(300);
  });

  it('should be call handleQueryReceivablesByFilters and return the data from db', async () => {
    const data = {
      content: [
        {
          personUserId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef4',
          userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
          descriptionReceivable: 'Test Receivable 1',
          fixedReceivable: true,
          receivableDate: new Date().getTime(),
          receivalDate: null,
          receival: false,
          icon: null,
          amount: 100,
          categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
          categoryDescription: 'Comissões e Bonificações',
          categoryDescriptionEnum: CategoryDescriptionEnum.REIMBURSEMENTS,
          categoryGroup: CategoryGroupEnum.REVENUES,
          paymentStatus: PaymentStatusDescriptionEnum.DUE_DAY,
          createdAt: new Date().getTime(),
          updatedAt: null,
        },
        {
          id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
          personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
          userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
          descriptionReceivable: 'Test Receivable 2',
          fixedReceivable: false,
          receivableDate: new Date().getTime(),
          receivalDate: new Date().getTime(),
          receival: true,
          icon: null,
          amount: 200,
          categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
          categoryDescription: 'Aluguéis e Rendimentos de Ativos',
          categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
          categoryGroup: CategoryGroupEnum.REVENUES,
          paymentMethodDescription: 'Pix',
          paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
          paymentStatus: PaymentStatusDescriptionEnum.PAID,
          createdAt: new Date().getTime(),
          updatedAt: null,
        },
      ],
      totalElements: 2,
      totalPages: 1,
      page: 0,
      size: 10,
      ordering: null,
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.handleQueryReceivablesByFilters.mockResolvedValue(data);

    const initialDate = new Date('2025-07-01').getTime();
    const finalDate = new Date('2025-07-31').getTime();

    const key = `${userIdMock}:${keyController}-list-receivables-by-filters-initialDate-${initialDate}-finalDate-${finalDate}`;

    const result = await receivableService.handleQueryReceivablesByFilters({
      userId: userIdMock,
      period: {
        initialDate,
        finalDate,
      },
    });

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(result.content.length).toEqual(2);
    expect(cacheMock.save).toHaveBeenCalled();
  });

  it('should be call handleQueryReceivablesByFilters and return the data from cache', async () => {
    const data = {
      content: [
        {
          personUserId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef4',
          userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
          descriptionReceivable: 'Test Receivable 1',
          fixedReceivable: true,
          receivableDate: new Date().getTime(),
          receivalDate: null,
          receival: false,
          icon: null,
          amount: 100,
          categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
          categoryDescription: 'Comissões e Bonificações',
          categoryDescriptionEnum: CategoryDescriptionEnum.REIMBURSEMENTS,
          categoryGroup: CategoryGroupEnum.REVENUES,
          paymentStatus: PaymentStatusDescriptionEnum.DUE_DAY,
          createdAt: new Date().getTime(),
          updatedAt: null,
        },
        {
          id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
          personUserId: 'b2c3d4e5-f6a1-8901-2345-67890abcde16',
          userId: 'b2c3d4e5-f6a1-8901-2345-67890abcde17',
          descriptionReceivable: 'Test Receivable 2',
          fixedReceivable: false,
          receivableDate: new Date().getTime(),
          receivalDate: new Date().getTime(),
          receival: true,
          icon: null,
          amount: 200,
          categoryId: 'b2c3d4e5-f6a1-8901-2345-67890abcde13',
          categoryDescription: 'Aluguéis e Rendimentos de Ativos',
          categoryDescriptionEnum: CategoryDescriptionEnum.RENT_INCOME,
          categoryGroup: CategoryGroupEnum.REVENUES,
          paymentMethodDescription: 'Pix',
          paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.PIX,
          paymentStatus: PaymentStatusDescriptionEnum.PAID,
          createdAt: new Date().getTime(),
          updatedAt: null,
        },
      ],
      totalElements: 2,
      totalPages: 1,
      page: 0,
      size: 10,
      ordering: null,
    };

    cacheMock.recover.mockResolvedValue(data);
    dbMock.handleQueryReceivablesByFilters.mockResolvedValue({
      ...data,
      content: [],
      totalElements: 0,
    });

    const initialDate = new Date('2025-07-01').getTime();
    const finalDate = new Date('2025-07-31').getTime();

    const key = `${userIdMock}:${keyController}-list-receivables-by-filters-initialDate-${initialDate}-finalDate-${finalDate}`;

    const result = await receivableService.handleQueryReceivablesByFilters({
      userId: userIdMock,
      period: {
        initialDate,
        finalDate,
      },
    });

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(result.content.length).toEqual(2);
    expect(cacheMock.save).not.toHaveBeenCalled();
  });
});
