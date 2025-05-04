import { MergeSortGateway } from '@/domain/Helpers/gateway/merge-sort.gateway';
import { dbFirestore } from '../../database/firebase/firebase.database';
import { BillsRepositoryFirebase } from './bill.repository.firebase';
import { firestore } from '@/test/mocks/firebase-admin.mock';
import { ApplyPaginationHelper } from '../../helpers/apply-pagination.helpers';
import { MargeSortHelper } from '../../helpers/merge-sort.helpers';
import { SortOrder } from '@/domain/dtos/listParamsDto.dto';
import { ErrorsFirebase } from '../../database/firebase/errorHandling';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { HandleCanProgressToWritteOperationHelper } from '../../helpers/handle-can-progress-to-writte-operation.helpers';

const billsItemsMock = [
  {
    id: '24177d92-1aee-4479-859b-72f01c9ade24',
    data: () => ({
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Faculdade',
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 8209.56,
      paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
      paymentStatusDescription: 'Pago',
      categoryId: 'efc9c97d-70b8-49ce-8674-9b0cedf2c3f0',
      categoryDescription: 'Educação e Leitura',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
      updatedAt: null,
    }),
  },
  {
    id: '121377d92-1aee-4479-859b-72f01c9ade24',
    data: () => ({
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Supermercado',
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 1200.0,
      paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
      paymentStatusDescription: 'Pago',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      isPaymentCardBill: false,
      isShoppingListBill: true,
      createdAt: new Date().getTime(),
      updatedAt: null,
    }),
  },
  {
    id: '8766541424-1aee-4479-859b-72f01c9ade24',
    data: () => ({
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Energia',
      fixedBill: false,
      billDate: new Date().getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 148.0,
      paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
      paymentStatusDescription: 'Pago',
      categoryId: 'deb29e2b-edb0-441e-be56-78d7e10f2e12',
      categoryDescription: 'Moradia e Manutenção Residencial',
      paymentMethodId: 'f8c3e2b7-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date().getTime(),
      updatedAt: null,
    }),
  },
];

const billsItemsSearchByPeriod = [
  {
    id: '24177d92-1aee-4479-859b-72f01c9ade24',
    data: () => ({
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Supermercado',
      fixedBill: false,
      billDate: new Date('03-01-2025').getTime(),
      payDate: new Date().getTime(),
      payOut: true,
      icon: null,
      amount: 1200.0,
      paymentStatusId: 'd5a2f9c1-3e6a-41b9-9e6d-5c8eaf39b1b2',
      paymentStatusDescription: 'Pago',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Supermercado',
      paymentMethodId: 'g12c3e1b2-4a9e-4f6b-8d2e-3b7c6a1e5f9d',
      paymentMethodDescription: 'Pix',
      isPaymentCardBill: false,
      isShoppingListBill: true,
      createdAt: new Date('03-01-2025').getTime(),
      updatedAt: null,
    }),
  },
  {
    id: '19582167-7jwr-1142-65cb-74d03d7az318',
    data: () => ({
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Tim',
      fixedBill: true,
      billDate: new Date('03-01-2025').getTime(),
      payDate: new Date().getTime(),
      payOut: false,
      icon: null,
      amount: 60.0,
      paymentStatusId: 'b78994ce-b7cb-4eed-9bdc-b7443358300c',
      paymentStatusDescription: 'A pagar',
      categoryId: '7a3f4c8d-0e1b-43a9-91b5-4c7f6d9b2a6e',
      categoryDescription: 'Assinatura de Internet, Telefonia e Streamings',
      paymentMethodId: '',
      paymentMethodDescription: '',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date('03-01-2025').getTime(),
      updatedAt: null,
    }),
  },
  {
    id: '48273619-3gtd-7831-92ad-83b18e3bp932',
    data: () => ({
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Luz',
      fixedBill: true,
      billDate: new Date('03-12-2025').getTime(),
      payDate: new Date().getTime(),
      payOut: false,
      icon: null,
      amount: 120.0,
      paymentStatusId: 'b78994ce-b7cb-4eed-9bdc-b7443358300c',
      paymentStatusDescription: 'A pagar',
      categoryId: '67815e45-44c3-415c-ba5f-5ab8998d7da6',
      categoryDescription: 'Serviços e Utilidades Públicas',
      paymentMethodId: '',
      paymentMethodDescription: '',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date('03-12-2025').getTime(),
      updatedAt: null,
    }),
  },
  {
    id: '48273619-3gtd-7831-92ad-83b18e3bp932',
    data: () => ({
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Água',
      fixedBill: true,
      billDate: new Date('03-26-2025').getTime(),
      payDate: new Date().getTime(),
      payOut: false,
      icon: null,
      amount: 90.0,
      paymentStatusId: 'b78994ce-b7cb-4eed-9bdc-b7443358300c',
      paymentStatusDescription: 'A pagar',
      categoryId: '67815e45-44c3-415c-ba5f-5ab8998d7da6',
      categoryDescription: 'Serviços e Utilidades Públicas',
      paymentMethodId: '',
      paymentMethodDescription: '',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date('03-26-2025').getTime(),
      updatedAt: null,
    }),
  },
  {
    id: '87263410-4qws-3409-81ab-63c09b8bk215',
    data: () => ({
      personUserId: '06627d91-1aee-4479-859b-72f01c9ade24',
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      descriptionBill: 'Cartão Visa',
      fixedBill: true,
      billDate: new Date('04-01-2025').getTime(),
      payDate: new Date().getTime(),
      payOut: false,
      icon: null,
      amount: 5200.0,
      paymentStatusId: 'b78994ce-b7cb-4eed-9bdc-b7443358300c',
      paymentStatusDescription: 'A pagar',
      categoryId: '67815e45-44c3-415c-ba5f-5ab8998d7da6',
      categoryDescription: 'Despesa com Cartão de Crédito',
      paymentMethodId: '',
      paymentMethodDescription: '',
      isPaymentCardBill: false,
      isShoppingListBill: false,
      createdAt: new Date('04-01-2025').getTime(),
      updatedAt: null,
    }),
  },
];

const userIdMock = '1234567d';

let billRepo: BillsRepositoryFirebase;
const mergeSortMock: MergeSortGateway = new MargeSortHelper();
const applayPagination: ApplyPaginationHelper = new ApplyPaginationHelper();
const handleCanProgressToWritteOperation: HandleCanProgressToWritteOperationHelper =
  new HandleCanProgressToWritteOperationHelper();

describe('Bill Repository Firebase', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    jest.clearAllMocks();

    billRepo = BillsRepositoryFirebase.create(
      dbFirestore,
      mergeSortMock,
      applayPagination,
      handleCanProgressToWritteOperation,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.NODE_ENV = 'development';
    BillsRepositoryFirebase['instance'] = null as any;
  });

  it('should be return Bills list when exist items in database', async () => {
    firestore.where().orderBy().get.mockResolvedValueOnce({
      docs: billsItemsMock,
    });

    const result = await billRepo.getBills({
      page: 0,
      size: 10,
      userId: userIdMock,
    });

    expect(result.content.length).toEqual(3);
    expect(result.totalElements).toEqual(3);
    expect(result.page).toEqual(0);
    expect(result.size).toEqual(10);
    expect(result.totalPages).toEqual(1);
    expect(result.ordering).toBeNull();
  });

  it('should return the page that specified in page attribute of the request', async () => {
    firestore.where().orderBy().get.mockResolvedValueOnce({
      docs: billsItemsMock,
    });

    const result = await billRepo.getBills({
      page: 1,
      size: 2,
      userId: userIdMock,
    });

    expect(result.content.length).toEqual(1);
    expect(result.totalElements).toEqual(3);
    expect(result.page).toEqual(1);
    expect(result.size).toEqual(2);
    expect(result.totalPages).toEqual(2);
    expect(result.ordering).toBeNull();
  });

  it('should return the number of items that specified in size attribute of the request', async () => {
    firestore.where().orderBy().get.mockResolvedValueOnce({
      docs: billsItemsMock,
    });

    const result = await billRepo.getBills({
      page: 0,
      size: 1,
      userId: userIdMock,
    });

    expect(result.content.length).toEqual(1);
    expect(result.totalElements).toEqual(3);
    expect(result.page).toEqual(0);
    expect(result.size).toEqual(1);
    expect(result.totalPages).toEqual(3);
    expect(result.ordering).toBeNull();
  });

  it('should be ordering by "asc" or "desc" of the attribute passed in ordering param.', async () => {
    firestore.where().orderBy().get.mockResolvedValueOnce({
      docs: billsItemsMock,
    });

    const result = await billRepo.getBills({
      page: 0,
      size: 10,
      userId: userIdMock,
      ordering: { amount: SortOrder.DESC },
    });

    expect(result.content.length).toEqual(3);
    expect(result.totalElements).toEqual(3);
    expect(result.page).toEqual(0);
    expect(result.size).toEqual(10);
    expect(result.totalPages).toEqual(1);
    expect(result.ordering).toEqual({ amount: 'desc' });

    const items = result.content;

    expect(items[0].amount).toEqual(8209.56);
    expect(items[1].amount).toEqual(1200);
    expect(items[2].amount).toEqual(148);
  });

  it('should be ordering by "asc" or "desc" of the attribute createdAt in ordering param.', async () => {
    firestore.where().orderBy().get.mockResolvedValueOnce({
      docs: billsItemsMock,
    });

    const result = await billRepo.getBills({
      page: 1,
      size: 2,
      userId: userIdMock,
      ordering: { createdAt: SortOrder.DESC },
    });

    expect(result.content.length).toEqual(1);
    expect(result.totalElements).toEqual(3);
    expect(result.page).toEqual(1);
    expect(result.size).toEqual(2);
    expect(result.totalPages).toEqual(2);
    expect(result.ordering).toEqual({ createdAt: 'desc' });
  });

  it('should be search with all parameters availables (sort, sortByBills, searchByDate, ordering).', async () => {
    firestore.where().orderBy().get.mockResolvedValueOnce({
      docs: billsItemsMock,
    });

    const result = await billRepo.getBills({
      size: 10,
      page: 0,
      sort: { categoryId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef1' },
      ordering: { amount: SortOrder.DESC },
      sortByBills: {
        amount: 12000,
        fixedBill: true,
        payOut: true,
        isPaymentCardBill: false,
        isShoppingListBill: true,
      },
      searchByDate: {
        billDate: {
          exactlyDate: new Date().getTime(),
        },
      },
      userId: userIdMock,
    });

    expect(result.content.length).toEqual(0);
    expect(result.totalElements).toEqual(0);
    expect(result.page).toEqual(0);
    expect(result.size).toEqual(10);
    expect(result.totalPages).toEqual(0);
    expect(result.ordering).toEqual({ amount: 'desc' });
  });

  it('should be search with searchByDate parameter with initial and final date request.', async () => {
    firestore.where().orderBy().get.mockResolvedValueOnce({
      docs: billsItemsMock,
    });

    const result = await billRepo.getBills({
      size: 10,
      page: 0,
      searchByDate: {
        payDate: {
          initialDate: new Date().getTime(),
          finalDate: new Date().getTime(),
        },
      },
      userId: userIdMock,
    });

    expect(result.content.length).toEqual(3);
    expect(result.totalElements).toEqual(3);
    expect(result.page).toEqual(0);
    expect(result.size).toEqual(10);
    expect(result.totalPages).toEqual(1);
    expect(result.ordering).toBeNull();
  });

  it('should be return throw Error if there is a problem with the getBills request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    firestore.where().orderBy().get.mockRejectedValueOnce(error);

    await expect(
      billRepo.getBills({ page: 0, size: 10, userId: userIdMock }),
    ).rejects.toThrow(error);
  });

  it('should be return Bill item when exist item in database', async () => {
    firestore
      .where()
      .orderBy()
      .get.mockResolvedValueOnce({
        exists: true,
        id: billsItemsMock[0].id,
        data: () => ({
          ...billsItemsMock[0].data(),
        }),
      });

    const result = await billRepo.getBillById({
      id: billsItemsMock[0].id,
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    });

    expect(firestore.where().orderBy().get).toHaveBeenCalledTimes(1);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(billsItemsMock[0].id);
    expect(result?.amount).toBe(billsItemsMock[0].data().amount);
    expect(result?.userId).toBe(billsItemsMock[0].data().userId);
    expect(result?.personUserId).toBe(billsItemsMock[0].data().personUserId);
  });

  it('should be return null when provided id param, but this item not exist in database.', async () => {
    firestore.doc().get.mockResolvedValueOnce({
      exists: false,
      id: null,
      data: () => null,
    });

    const result = await billRepo.getBillById({
      id: billsItemsMock[0].id,
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    });

    expect(firestore.doc().get).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });

  it('should be throw an erro if the userId to be different of the bill item in getBillById request', async () => {
    const error = await billRepo
      .getBillById({
        id: billsItemsMock[0].id,
        userId: 'a1b2c3d4',
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(TypeError);
  });

  it('should be return throw Error if there is a problem with the getBillById request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    firestore.where().orderBy().get.mockRejectedValueOnce(error);

    await expect(
      billRepo.getBillById({
        id: billsItemsMock[0].id,
        userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
      }),
    ).rejects.toThrow(error);
  });

  it('should be create a new Bill when all parameters are passed correctly', async () => {
    firestore.add.mockResolvedValueOnce({
      id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
    });

    const dataCreate = { ...billsItemsMock[0].data(), createdAt: null };

    const result = await billRepo.createBill({
      userId: dataCreate.userId,
      billData: dataCreate,
    });

    expect(firestore.add).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0' });
  });

  it('should be return throw Error if there is a problem with the createBill request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    firestore.add.mockRejectedValueOnce(error);

    const dataCreate = { ...billsItemsMock[0].data() };

    await expect(
      billRepo.createBill({
        userId: dataCreate.userId,
        billData: dataCreate,
      }),
    ).rejects.toThrow(error);
  });

  it('should be throw an error if the userId to be different of the bill item in createBill request', async () => {
    const dataCreate = { ...billsItemsMock[0].data() };

    const error = await billRepo
      .createBill({
        userId: 'a1b2c3d4-e5f6',
        billData: dataCreate,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      statusCode: 401,
    });

    expect(firestore.add).toHaveBeenCalledTimes(0);
  });

  it('should be update a Bill when all parameters are passed correctly', async () => {
    firestore.doc().update.mockResolvedValueOnce({});

    firestore.doc().get.mockResolvedValueOnce({
      exists: true,
      id: billsItemsMock[0].id,
      data: () => ({
        ...billsItemsMock[0].data(),
      }),
    });

    const dataUpdate = {
      id: billsItemsMock[0].id,
      ...billsItemsMock[0].data(),
      updatedAt: null,
    };

    const result = await billRepo.updateBill({
      billId: billsItemsMock[0].id,
      billData: dataUpdate,
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    });

    expect(firestore.doc().update).toHaveBeenCalledTimes(1);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(billsItemsMock[0].id);
    expect(result?.amount).toBe(billsItemsMock[0].data().amount);
    expect(result?.userId).toBe(billsItemsMock[0].data().userId);
    expect(result?.personUserId).toBe(billsItemsMock[0].data().personUserId);
  });

  it('should be throw an error if the userId to be different of the bill item in updateBill', async () => {
    const dataUpdate = {
      id: billsItemsMock[0].id,
      ...billsItemsMock[0].data(),
    };

    firestore.doc().get.mockResolvedValueOnce({
      exists: true,
      id: billsItemsMock[0].id,
      data: () => ({
        ...billsItemsMock[0].data(),
      }),
    });

    const error = await billRepo
      .updateBill({
        billId: billsItemsMock[0].id,
        billData: dataUpdate,
        userId: 'a1b2c3d4-e5f6',
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);

    expect(firestore.doc().update).toHaveBeenCalledTimes(0);
  });

  it('should be delete a Receivable when all parameters to past correctly', async () => {
    firestore.doc().delete.mockResolvedValueOnce({});

    firestore.doc().get.mockResolvedValueOnce({
      exists: true,
      id: billsItemsMock[0].id,
      data: () => ({
        ...billsItemsMock[0].data(),
      }),
    });

    await billRepo.deleteBill({
      id: billsItemsMock[0].id,
      userId: 'b3e1c7f2-2d4e-48a5-a1f3-ef7c1e36d9b4',
    });

    expect(firestore.doc().get).toHaveBeenCalledTimes(1);
    expect(firestore.doc().delete).toHaveBeenCalledTimes(1);
  });

  it('should be call billsPayableMonth and return bills list that attend the requirements of the period and payout false', async () => {
    firestore.where().orderBy().get.mockResolvedValueOnce({
      docs: billsItemsSearchByPeriod,
    });

    const result = await billRepo.billsPayableMonth({
      userId: userIdMock,
      period: {
        initialDate: new Date('03-01-2025').getTime(),
        finalDate: new Date('03-31-2025').getTime(),
      },
    });

    expect(result.length).toEqual(3);
    expect(result[0].billDate).toEqual(new Date('03-01-2025').getTime());
    expect(result[0].payOut).toBeFalsy();
    expect(result[1].billDate).toEqual(new Date('03-12-2025').getTime());
    expect(result[1].payOut).toBeFalsy();
    expect(result[2].billDate).toEqual(new Date('03-26-2025').getTime());
    expect(result[2].payOut).toBeFalsy();
  });

  it('should be throw an error when call billsPayableMonth if the userId do not exist in param', async () => {
    const error = await billRepo
      .billsPayableMonth({
        userId: '',
        period: {
          initialDate: new Date('03-01-2025').getTime(),
          finalDate: new Date('03-31-2025').getTime(),
        },
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      statusCode: 401,
    });
  });

  it('should be throw an error when call billsPayableMonth if the period not defined or initialDate or finalDate dont be defined/exist', async () => {
    let error = await billRepo
      .billsPayableMonth({
        userId: userIdMock,
        period: undefined as any,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_PERIOD,
      statusCode: 400,
    });

    error = await billRepo
      .billsPayableMonth({
        userId: userIdMock,
        period: {
          initialDate: new Date().getTime(),
          finalDate: 'abs121212' as any,
        },
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_PERIOD,
      statusCode: 400,
    });

    error = await billRepo
      .billsPayableMonth({
        userId: userIdMock,
        period: {
          initialDate: undefined as any,
          finalDate: new Date().getTime(),
        },
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_PERIOD,
      statusCode: 400,
    });
  });
});
