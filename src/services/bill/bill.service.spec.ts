import { BillRepositoryGateway } from '@/domain/Bill/gateway/bill.repository.gateway';
import { BillService } from './bill.service';
import { CacheGateway } from '@/domain/Cache/gateway/cache.gateway';
import { SortOrder } from '@/domain/dtos/listParamsDto.dto';
import { GenerateHashGateway } from '@/domain/Helpers/gateway/generate-hash.gateway';
import { generateHashHelper } from '@/infra/helpers';
import { BillDTO } from '@/domain/Bill/dtos/bill.dto';
import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';
import { CategoryDescriptionEnum } from '@/domain/Category/enums/category-description.enum';
import { CategoryGroupEnum } from '@/domain/Category/enums/category-group.enum';
import { PaymentMethodDescriptionEnum } from '@/domain/Payment_Method/enums/payment-method-description.enum';
import { PaymentStatusDescriptionEnum } from '@/domain/Payment_Status/enum/payment-status-description.enum';

let dbMock: jest.Mocked<BillRepositoryGateway>;
let cacheMock: jest.Mocked<CacheGateway>;
let generateMock: jest.Mocked<GenerateHashGateway>;

describe('Bill Service', () => {
  let billService: BillService;

  const keyController = 'bill';

  const userIdMock = '121234';

  beforeEach(() => {
    jest.clearAllMocks();

    dbMock = {
      getBills: jest.fn(),
      getBillById: jest.fn(),
      createBill: jest.fn(),
      updateBill: jest.fn(),
      deleteBill: jest.fn(),
      billsPayableMonth: jest.fn(),
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

    billService = BillService.create(dbMock, cacheMock, generateMock);
  });

  afterEach(() => {
    (BillService as any).instance = undefined;
  });

  it('should be create a instance of the BillService class when will be use create method', () => {
    expect(billService).toBeInstanceOf(BillService);
  });

  it('should be call getBills and return the data from db', async () => {
    const data = {
      content: [
        {
          id: '121377d92-1aee-4479-859b-72f01c9ade24',
          personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
          userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
          descriptionBill: 'Compras no Supermercado',
          categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
          categoryDescription: 'Supermercado',
          categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
          categoryGroup: CategoryGroupEnum.SHOPPING,
          fixedBill: false,
          billDate: new Date().getTime(),
          payDate: new Date().getTime(),
          payOut: true,
          icon: null,
          amount: 1200.56,
          paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
          paymentMethodDescription: 'Cartão de Crédito',
          paymmentMethodDescriptionEnum:
            PaymentMethodDescriptionEnum.CREDIT_CARD,
          isPaymentCardBill: false,
          paymentStatus: PaymentStatusDescriptionEnum.PAID,
          isShoppingListBill: false,
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
      sort: { category: CategoryDescriptionEnum.SUPERMARKET },
      ordering: { amount: SortOrder.DESC },
      sortByBills: {
        amount: 1200.0,
        payOut: true,
      },
      searchByDate: {
        billDate: {
          exactlyDate: new Date().getTime(),
        },
      },
      userId: userIdMock,
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getBills.mockResolvedValue(data);
    const generateHashFromInput = generateHashHelper.execute(input);
    generateMock.execute.mockReturnValue(generateHashFromInput);

    const key = `${input.userId}:${keyController}-list-all-${generateHashFromInput}`;

    const result = await billService.getBills(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getBills).toHaveBeenCalled();
    expect(dbMock.getBills).toHaveBeenCalledWith(input);
    expect(cacheMock.save).toHaveBeenCalled();
    expect(result.content.length).toEqual(1);
  });

  it('should be call getBills and return the data from cache provider', async () => {
    const data = {
      content: [
        {
          id: '121377d92-1aee-4479-859b-72f01c9ade24',
          personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
          userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
          descriptionBill: 'Compras no Supermercado',
          categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
          categoryDescription: 'Supermercado',
          categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
          categoryGroup: CategoryGroupEnum.SHOPPING,
          fixedBill: false,
          billDate: new Date().getTime(),
          payDate: new Date().getTime(),
          payOut: true,
          icon: null,
          amount: 1200.56,
          paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
          paymentMethodDescription: 'Cartão de Crédito',
          paymmentMethodDescriptionEnum:
            PaymentMethodDescriptionEnum.CREDIT_CARD,
          isPaymentCardBill: false,
          paymentStatus: PaymentStatusDescriptionEnum.PAID,
          isShoppingListBill: false,
          createdAt: new Date().getTime(),
          updatedAt: null,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      size: 10,
      ordering: null,
    };

    const input = {
      size: 10,
      page: 0,
      sort: { category: CategoryDescriptionEnum.SUPERMARKET },
      ordering: { amount: SortOrder.DESC },
      sortByBills: {
        amount: 1200.0,
        payOut: true,
      },
      searchByDate: {
        billDate: {
          exactlyDate: new Date().getTime(),
        },
      },
      userId: userIdMock,
    };

    cacheMock.recover.mockResolvedValue(data);
    const generateHashFromInput = generateHashHelper.execute(input);
    generateMock.execute.mockReturnValue(generateHashFromInput);

    const key = `${input.userId}:${keyController}-list-all-${generateHashFromInput}`;

    const result = await billService.getBills(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getBills).not.toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result.content.length).toEqual(1);
  });

  it('should be call getBills and mustnt be not call the save method of the cache provider when the content attribute of the repository data response to be empty list', async () => {
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
      sort: { category: CategoryDescriptionEnum.SUPERMARKET },
      ordering: { amount: SortOrder.DESC },
      sortByBills: {
        amount: 1200.0,
        payOut: true,
      },
      searchByDate: {
        billDate: {
          exactlyDate: new Date().getTime(),
        },
      },
      userId: userIdMock,
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getBills.mockResolvedValue(data);
    const generateHashFromInput = generateHashHelper.execute(input);
    generateMock.execute.mockReturnValue(generateHashFromInput);

    const key = `${input.userId}:${keyController}-list-all-${generateHashFromInput}`;

    const result = await billService.getBills(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getBills).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result.content.length).toEqual(0);
  });

  it('should be call getBills and must be call the db repository when the content attribute of the cache repository return empty list', async () => {
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
      sort: { category: CategoryDescriptionEnum.SUPERMARKET },
      ordering: { amount: SortOrder.DESC },
      sortByBills: {
        amount: 1200.0,
        payOut: true,
      },
      searchByDate: {
        billDate: {
          exactlyDate: new Date().getTime(),
        },
      },
      userId: userIdMock,
    };
    cacheMock.recover.mockResolvedValue(data);
    dbMock.getBills.mockResolvedValue(data);
    const generateHashFromInput = generateHashHelper.execute(input);
    generateMock.execute.mockReturnValue(generateHashFromInput);

    const key = `${input.userId}:${keyController}-list-all-${generateHashFromInput}`;

    const result = await billService.getBills(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getBills).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result.content.length).toEqual(0);
  });

  it('should be call getBillById and return the data from db', async () => {
    const data = {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Compras no Supermercado',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 1200.56,
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Cartão de Crédito',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
      isPaymentCardBill: false,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    const input = {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      userId: userIdMock,
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getBillById.mockResolvedValue(data);

    const key = `${input.userId}:${keyController}-list-by-id-${data.id}`;

    const result = await billService.getBillById(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getBillById).toHaveBeenCalled();
    expect(cacheMock.save).toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it('should be call getBillById and return the data from cache provider', async () => {
    const data = {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Compras no Supermercado',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 1200.56,
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Cartão de Crédito',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
      isPaymentCardBill: false,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    const input = {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      userId: userIdMock,
    };

    cacheMock.recover.mockResolvedValue(data);

    const key = `${input.userId}:${keyController}-list-by-id-${data.id}`;

    const result = await billService.getBillById(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getBillById).not.toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it('should be call getBillById and mustnt be not call the save method of the cache provider when the data response to be null', async () => {
    const data = null;

    const input = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      userId: userIdMock,
    };

    cacheMock.recover.mockResolvedValue(null);
    dbMock.getBillById.mockResolvedValue(data);

    const key = `${input.userId}:${keyController}-list-by-id-${input.id}`;

    const result = await billService.getBillById(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getBillById).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should be call getBillById and must be call the db repository when data response of the cache repository return null', async () => {
    const data = null;

    const input = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      userId: userIdMock,
    };

    cacheMock.recover.mockResolvedValue(data);
    dbMock.getBillById.mockResolvedValue(data);

    const key = `${input.userId}:${keyController}-list-by-id-${input.id}`;

    const result = await billService.getBillById(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.getBillById).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should be call method createBill from db provider and after response this provider, must delete the all stored keys that represent list-all from cache provider', async () => {
    const data = {
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Compras no Supermercado',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 1200.56,
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Cartão de Crédito',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
    };

    const responseData = {
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
    };

    dbMock.createBill.mockResolvedValue(responseData);

    const result = await billService.createBill({
      userId: userIdMock,
      billData: data,
    });

    const patternKeysToDelete = `${userIdMock}:${keyController}-list`;

    expect(dbMock.createBill).toHaveBeenCalled();
    expect(dbMock.createBill).toHaveBeenCalledWith({
      userId: userIdMock,
      billData: data,
    });
    expect(cacheMock.deleteWithPattern).toHaveBeenCalled();
    expect(cacheMock.deleteWithPattern).toHaveBeenCalledWith(
      patternKeysToDelete,
    );
    expect(result?.id).toEqual(responseData.id);
  });

  it('should be call method createBill from db provider and after response failed, mustnt call deleteWithPattern from cache provider.', async () => {
    const data = {
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Compras no Supermercado',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 1200.56,
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Cartão de Crédito',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
    };

    const responseData = {
      id: undefined as any,
    };

    dbMock.createBill.mockResolvedValue(responseData);

    await billService.createBill({
      userId: userIdMock,
      billData: data,
    });

    expect(dbMock.createBill).toHaveBeenCalled();
    expect(dbMock.createBill).toHaveBeenCalledWith({
      userId: userIdMock,
      billData: data,
    });
    expect(cacheMock.deleteWithPattern).not.toHaveBeenCalled();
  });

  it('should be call method updateBill from db provider and after response this provider, must delete the all stored keys that represent list-all from cache provider and find the data from key in cache and data replace.', async () => {
    const data = {
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Compras no Supermercado',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 1200.56,
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Cartão de Crédito',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
      isPaymentCardBill: false,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    dbMock.updateBill.mockResolvedValue(data);

    const result = await billService.updateBill({
      userId: userIdMock,
      billData: data,
      billId: data.id,
    });

    const patternKeysToDelete = `${userIdMock}:${keyController}-list`;

    const keyToDataReplace = `${userIdMock}:${keyController}-bill-by-id-${data.id}`;

    expect(dbMock.updateBill).toHaveBeenCalled();
    expect(dbMock.updateBill).toHaveBeenCalledWith({
      userId: userIdMock,
      billData: data,
      billId: data.id,
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
      id: '121377d92-1aee-4479-859b-72f01c9ade24',
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Compras no Supermercado',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
      categoryGroup: CategoryGroupEnum.SHOPPING,
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 1200.56,
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Cartão de Crédito',
      paymmentMethodDescriptionEnum: PaymentMethodDescriptionEnum.CREDIT_CARD,
      isPaymentCardBill: false,
      paymentStatus: PaymentStatusDescriptionEnum.PAID,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
      updatedAt: null,
    };

    dbMock.updateBill.mockResolvedValue(undefined as any);

    const result = await billService.updateBill({
      userId: userIdMock,
      billData: data,
      billId: data.id,
    });

    expect(dbMock.updateBill).toHaveBeenCalled();
    expect(dbMock.updateBill).toHaveBeenCalledWith({
      userId: userIdMock,
      billData: data,
      billId: data.id,
    });
    expect(cacheMock.deleteWithPattern).not.toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result).not.toBeNull();
  });

  it('should be call method deleteBill from db provider and after response this provider, must delete the all stored keys that represent list-all from cache provider', async () => {
    const patternKeysToDelete = `${userIdMock}:${keyController}`;

    await billService.deleteBill({
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      userId: userIdMock,
    });

    expect(dbMock.deleteBill).toHaveBeenCalled();
    expect(dbMock.deleteBill).toHaveBeenCalledWith({
      id: '24177d92-1aee-4479-859b-72f01c9ade24',
      userId: userIdMock,
    });
    expect(cacheMock.deleteWithPattern).toHaveBeenCalled();
    expect(cacheMock.deleteWithPattern).toHaveBeenCalledWith(
      patternKeysToDelete,
    );
  });

  it('should be call billsPayableMonth and return the data from cache provider', async () => {
    const data = {
      content: [
        {
          personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
          userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
          descriptionBill: 'Mensalidade Faculdade',
          fixedBill: false,
          categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
          categoryDescription: 'Educação',
          categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
          categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
          billDate: new Date('03-01-2025').getTime(),
          payDate: null,
          payOut: false,
          icon: null,
          amount: 1200.0,
          paymentStatus: PaymentStatusDescriptionEnum.OVERDUE,
          isPaymentCardBill: false,
          isShoppingListBill: false,
          createdAt: new Date('03-01-2025').getTime(),
          updatedAt: null,
        },
        {
          id: '19582167-7jwr-1142-65cb-74d03d7az318',
          personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
          userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
          descriptionBill: 'Tim',
          categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
          categoryDescription: 'Internet/TV',
          categoryDescriptionEnum: CategoryDescriptionEnum.INTERNET_TV,
          categoryGroup: CategoryGroupEnum.HOUSING,
          fixedBill: true,
          billDate: new Date('03-01-2025').getTime(),
          payDate: null,
          payOut: false,
          icon: null,
          amount: 60.0,
          paymentStatus: PaymentStatusDescriptionEnum.OVERDUE,
          isPaymentCardBill: false,
          isShoppingListBill: false,
          createdAt: new Date('03-01-2025').getTime(),
          updatedAt: null,
        },
        {
          id: '48273619-3gtd-7831-92ad-83b18e3bp932',
          personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
          userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
          descriptionBill: 'Luz',
          categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
          categoryDescription: 'Energia',
          categoryDescriptionEnum: CategoryDescriptionEnum.ENERGY,
          categoryGroup: CategoryGroupEnum.HOUSING,
          fixedBill: true,
          billDate: new Date('03-12-2025').getTime(),
          payDate: null,
          payOut: false,
          icon: null,
          amount: 120.0,
          paymentStatus: PaymentStatusDescriptionEnum.OVERDUE,
          isPaymentCardBill: false,
          isShoppingListBill: false,
          createdAt: new Date('03-12-2025').getTime(),
          updatedAt: null,
        },
        {
          id: '48273619-3gtd-7831-92ad-83b18e3bp932',
          personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
          userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
          descriptionBill: 'Compras no Supermercado',
          categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
          categoryDescription: 'Supermercado',
          categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
          categoryGroup: CategoryGroupEnum.SHOPPING,
          fixedBill: false,
          billDate: new Date('03-26-2025').getTime(),
          payDate: null,
          payOut: false,
          icon: null,
          amount: 1200.0,
          paymentStatus: PaymentStatusDescriptionEnum.OVERDUE,
          isPaymentCardBill: false,
          isShoppingListBill: false,
          createdAt: new Date('03-26-2025').getTime(),
          updatedAt: null,
        },
      ],
      page: 0,
      size: 10,
      totalElements: 4,
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

    const key = `${input.userId}:${keyController}-list-by-payable-month-${input.period.initialDate}-${input.period.finalDate}-${input.page}-${input.size}`;

    const result = await billService.billsPayableMonth(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.billsPayableMonth).not.toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result.content.length).toEqual(4);
  });

  it('should be call billsPayableMonth and return the data from db provider', async () => {
    const data = {
      content: [
        {
          personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
          userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
          descriptionBill: 'Mensalidade Faculdade',
          fixedBill: false,
          categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
          categoryDescription: 'Educação',
          categoryDescriptionEnum: CategoryDescriptionEnum.COLLEGE_TUITION,
          categoryGroup: CategoryGroupEnum.EDUCATION_AND_STUDIES,
          billDate: new Date('03-01-2025').getTime(),
          payDate: null,
          payOut: false,
          icon: null,
          amount: 1200.0,
          paymentStatus: PaymentStatusDescriptionEnum.OVERDUE,
          isPaymentCardBill: false,
          isShoppingListBill: false,
          createdAt: new Date('03-01-2025').getTime(),
          updatedAt: null,
        },
        {
          id: '19582167-7jwr-1142-65cb-74d03d7az318',
          personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
          userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
          descriptionBill: 'Tim',
          categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
          categoryDescription: 'Internet/TV',
          categoryDescriptionEnum: CategoryDescriptionEnum.INTERNET_TV,
          categoryGroup: CategoryGroupEnum.HOUSING,
          fixedBill: true,
          billDate: new Date('03-01-2025').getTime(),
          payDate: null,
          payOut: false,
          icon: null,
          amount: 60.0,
          paymentStatus: PaymentStatusDescriptionEnum.OVERDUE,
          isPaymentCardBill: false,
          isShoppingListBill: false,
          createdAt: new Date('03-01-2025').getTime(),
          updatedAt: null,
        },
        {
          id: '48273619-3gtd-7831-92ad-83b18e3bp932',
          personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
          userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
          descriptionBill: 'Luz',
          categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
          categoryDescription: 'Energia',
          categoryDescriptionEnum: CategoryDescriptionEnum.ENERGY,
          categoryGroup: CategoryGroupEnum.HOUSING,
          fixedBill: true,
          billDate: new Date('03-12-2025').getTime(),
          payDate: null,
          payOut: false,
          icon: null,
          amount: 120.0,
          paymentStatus: PaymentStatusDescriptionEnum.OVERDUE,
          isPaymentCardBill: false,
          isShoppingListBill: false,
          createdAt: new Date('03-12-2025').getTime(),
          updatedAt: null,
        },
        {
          id: '48273619-3gtd-7831-92ad-83b18e3bp932',
          personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
          userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
          descriptionBill: 'Compras no Supermercado',
          categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
          categoryDescription: 'Supermercado',
          categoryDescriptionEnum: CategoryDescriptionEnum.SUPERMARKET,
          categoryGroup: CategoryGroupEnum.SHOPPING,
          fixedBill: false,
          billDate: new Date('03-26-2025').getTime(),
          payDate: null,
          payOut: false,
          icon: null,
          amount: 1200.0,
          paymentStatus: PaymentStatusDescriptionEnum.OVERDUE,
          isPaymentCardBill: false,
          isShoppingListBill: false,
          createdAt: new Date('03-26-2025').getTime(),
          updatedAt: null,
        },
      ],
      page: 0,
      size: 10,
      totalElements: 4,
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

    const key = `${input.userId}:${keyController}-list-by-payable-month-${input.period.initialDate}-${input.period.finalDate}-${input.page}-${input.size}`;

    cacheMock.recover.mockResolvedValue(null);
    dbMock.billsPayableMonth.mockResolvedValue(data);

    const result = await billService.billsPayableMonth(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.billsPayableMonth).toHaveBeenCalled();
    expect(cacheMock.save).toHaveBeenCalled();
    expect(result.content.length).toEqual(4);
  });

  it('should be call billsPayableMonth and mustnt be not call the save method of the cache provider when the data response from db provider to be empty list', async () => {
    const data: ResponseListDTO<BillDTO> = {
      content: [],
      page: 0,
      size: 10,
      totalPages: 0,
      totalElements: 0,
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
    dbMock.billsPayableMonth.mockResolvedValue(data);

    const key = `${input.userId}:${keyController}-list-by-payable-month-${input.period.initialDate}-${input.period.finalDate}-${input.page}-${input.size}`;

    const result = await billService.billsPayableMonth(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.billsPayableMonth).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result.content.length).toEqual(0);
  });

  it('should be call billsPayableMonth and must be call the db repository when the data response of the cache repository return empty list', async () => {
    const data: ResponseListDTO<BillDTO> = {
      content: [],
      page: 0,
      size: 10,
      totalPages: 0,
      totalElements: 0,
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
    dbMock.billsPayableMonth.mockResolvedValue(data);

    const key = `${input.userId}:${keyController}-list-by-payable-month-${input.period.initialDate}-${input.period.finalDate}-${input.page}-${input.size}`;

    const result = await billService.billsPayableMonth(input);

    expect(cacheMock.recover).toHaveBeenCalled();
    expect(cacheMock.recover).toHaveBeenCalledWith(key);
    expect(dbMock.billsPayableMonth).toHaveBeenCalled();
    expect(cacheMock.save).not.toHaveBeenCalled();
    expect(result.content.length).toEqual(0);
  });
});
