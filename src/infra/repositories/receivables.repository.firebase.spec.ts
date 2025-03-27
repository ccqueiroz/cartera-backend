import { MergeSortGateway } from '../../domain/Helpers/gateway/merge-sort.gateway';
import { ReceivablesRepositoryFirebase } from './receivables.repository.firebase';
import { SortOrder } from '@/domain/dtos/listParamsDto.dto';
import { ErrorsFirebase } from '../database/firebase/errorHandling';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { dbFirestore } from '../database/firebase/firebase.database';
import { firestore } from '@/test/mocks/firebase-admin.mock';
import { MargeSortHelper } from '../helpers/merge-sort.helpers';
import { ApplyPaginationHelper } from '../helpers/apply-pagination.helpers';
import { HandleCanProgressToWritteOperationHelper } from '../helpers/handle-can-progress-to-writte-operation.helpers';

const receivablesItemsMocks = [
  {
    id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
    data: () => ({
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
    }),
  },
  {
    id: 'b2c3d4e5-f6a1-8901-2345-67890abcde12',
    data: () => ({
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
    }),
  },
  {
    id: 'c3d4e5f6-a1b2-9012-3456-7890abcdef23',
    data: () => ({
      categoryId: 'c3d4e5f6-a1b2-9012-3456-7890abcdef24',
      paymentMethodId: 'c3d4e5f6-a1b2-9012-3456-7890abcdef25',
      paymentStatusId: 'c3d4e5f6-a1b2-9012-3456-7890abcdef26',
      personUserId: 'c3d4e5f6-a1b2-9012-3456-7890abcdef27',
      userId: 'c3d4e5f6-a1b2-9012-3456-7890abcdef28',
      descriptionReceivable: 'Test Receivable 3',
      fixedReceivable: true,
      receivableDate: new Date().getTime(),
      icon: null,
      amount: 300,
      categoryDescription: 'Test Category 3',
      paymentMethodDescription: 'Test Payment Method 3',
      paymentStatusDescription: 'Overdue',
      createdAt: new Date().getTime(),
      receivalDate: null,
      receival: false,
      updatedAt: null,
    }),
  },
];

const userIdMock = '1234567d';

describe('Receivable Repository Firebase', () => {
  let receivableRepo: ReceivablesRepositoryFirebase;
  const mergeSortMock: MergeSortGateway = new MargeSortHelper();
  const applayPagination: ApplyPaginationHelper = new ApplyPaginationHelper();
  const handleCanProgressToWritteOperation: HandleCanProgressToWritteOperationHelper =
    new HandleCanProgressToWritteOperationHelper();

  beforeEach(() => {
    jest.clearAllMocks();

    receivableRepo = ReceivablesRepositoryFirebase.create(
      dbFirestore,
      mergeSortMock,
      applayPagination,
      handleCanProgressToWritteOperation,
    );
  });

  it('should be return Receivables list when exist items in database', async () => {
    firestore.where().orderBy().get.mockResolvedValueOnce({
      docs: receivablesItemsMocks,
    });

    const result = await receivableRepo.getReceivables({
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

  it('should return the number of items that specified in size attribute of the request', async () => {
    firestore.where().orderBy().get.mockResolvedValueOnce({
      docs: receivablesItemsMocks,
    });

    const result = await receivableRepo.getReceivables({
      page: 0,
      size: 2,
      userId: userIdMock,
    });

    expect(result.content.length).toEqual(2);
    expect(result.totalElements).toEqual(3);
    expect(result.page).toEqual(0);
    expect(result.size).toEqual(2);
    expect(result.totalPages).toEqual(2);
    expect(result.ordering).toBeNull();
  });

  it('should return the page that specified in page attribute of the request', async () => {
    firestore.where().orderBy().get.mockResolvedValueOnce({
      docs: receivablesItemsMocks,
    });

    const result = await receivableRepo.getReceivables({
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

  it('should be ordering by "asc" or "desc" of the attribute passed in ordering param.', async () => {
    firestore.where().orderBy().get.mockResolvedValueOnce({
      docs: receivablesItemsMocks,
    });

    const result = await receivableRepo.getReceivables({
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

    expect(items[0].amount).toEqual(300);
    expect(items[1].amount).toEqual(200);
    expect(items[2].amount).toEqual(100);
  });

  it('should be ordering by "asc" or "desc" of the attribute createdAt in ordering param.', async () => {
    firestore.where().orderBy().get.mockResolvedValueOnce({
      docs: receivablesItemsMocks,
    });

    const result = await receivableRepo.getReceivables({
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

  it('should be search with all parameters availables (sort, sortByReceivables, searchByDate, ordering).', async () => {
    firestore.where().orderBy().get.mockResolvedValueOnce({
      docs: receivablesItemsMocks,
    });

    const result = await receivableRepo.getReceivables({
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
      docs: receivablesItemsMocks,
    });

    const result = await receivableRepo.getReceivables({
      size: 10,
      page: 0,
      searchByDate: {
        receivableDate: {
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

  it('should be return throw Error if there is a problem with the getReceivables request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    firestore.where().orderBy().get.mockRejectedValueOnce(error);

    await expect(
      receivableRepo.getReceivables({ page: 0, size: 10, userId: userIdMock }),
    ).rejects.toThrow(error);
  });

  it('should be return Receivable item when exist item in database', async () => {
    firestore
      .where()
      .orderBy()
      .get.mockResolvedValueOnce({
        exists: true,
        id: receivablesItemsMocks[0].id,
        data: () => ({
          ...receivablesItemsMocks[0].data(),
        }),
      });

    const result = await receivableRepo.getReceivableById({
      id: receivablesItemsMocks[0].id,
      userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
    });

    expect(firestore.where().orderBy().get).toHaveBeenCalledTimes(1);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(receivablesItemsMocks[0].id);
    expect(result?.amount).toBe(receivablesItemsMocks[0].data().amount);
    expect(result?.userId).toBe(receivablesItemsMocks[0].data().userId);
    expect(result?.personUserId).toBe(
      receivablesItemsMocks[0].data().personUserId,
    );
  });

  it('should be return null when provided id param, but this item not exist in database.', async () => {
    firestore.doc().get.mockResolvedValueOnce({
      exists: false,
      id: null,
      data: () => null,
    });

    const result = await receivableRepo.getReceivableById({
      id: receivablesItemsMocks[0].id,
      userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
    });

    expect(firestore.doc().get).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });

  it('should be throw an erro if the userId to be different of the receivable item in getReceivableById request', async () => {
    const error = await receivableRepo
      .getReceivableById({
        id: receivablesItemsMocks[0].id,
        userId: 'a1b2c3d4',
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(TypeError);
  });

  it('should be return throw Error if there is a problem with the getReceivableById request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    firestore.where().orderBy().get.mockRejectedValueOnce(error);

    await expect(
      receivableRepo.getReceivableById({
        id: receivablesItemsMocks[0].id,
        userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
      }),
    ).rejects.toThrow(error);
  });

  it('should be create a new Receivable when all parameters are passed correctly', async () => {
    firestore.add.mockResolvedValueOnce({
      id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
    });

    const dataCreate = { ...receivablesItemsMocks[0].data(), createdAt: null };

    const result = await receivableRepo.createReceivable({
      userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
      receivableData: dataCreate,
    });

    expect(firestore.add).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 'a1b2c3d4-e5f6-7890-1234-56789abcdef0' });
  });

  it('should be return throw Error if there is a problem with the createReceivable request', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    firestore.add.mockRejectedValueOnce(error);

    const dataCreate = { ...receivablesItemsMocks[0].data() };

    await expect(
      receivableRepo.createReceivable({
        userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
        receivableData: dataCreate,
      }),
    ).rejects.toThrow(error);
  });

  it('should be throw an error if the userId to be different of the receivable item in createReceivable request', async () => {
    const dataCreate = { ...receivablesItemsMocks[0].data() };

    const error = await receivableRepo
      .createReceivable({
        userId: 'a1b2c3d4-e5f6',
        receivableData: dataCreate,
      })
      .catch((err) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      statusCode: 401,
    });

    expect(firestore.add).toHaveBeenCalledTimes(0);
  });

  it('should be update a Receivable when all parameters are passed correctly', async () => {
    firestore.doc().update.mockResolvedValueOnce({});

    firestore.doc().get.mockResolvedValueOnce({
      exists: true,
      id: receivablesItemsMocks[0].id,
      data: () => ({
        ...receivablesItemsMocks[0].data(),
      }),
    });

    const dataCreate = {
      id: receivablesItemsMocks[0].id,
      ...receivablesItemsMocks[0].data(),
      updatedAt: null,
    };

    const result = await receivableRepo.updateReceivable({
      receivableId: receivablesItemsMocks[0].id,
      receivableData: dataCreate,
      userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
    });

    expect(firestore.doc().update).toHaveBeenCalledTimes(1);
    expect(firestore.doc().get).toHaveBeenCalledTimes(1);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(receivablesItemsMocks[0].id);
    expect(result?.amount).toBe(receivablesItemsMocks[0].data().amount);
    expect(result?.userId).toBe(receivablesItemsMocks[0].data().userId);
    expect(result?.personUserId).toBe(
      receivablesItemsMocks[0].data().personUserId,
    );
  });

  it('should be throw an error if the userId to be different of the receivable item in updateReceivable', async () => {
    const dataUpdate = {
      id: receivablesItemsMocks[0].id,
      ...receivablesItemsMocks[0].data(),
    };

    firestore.doc().get.mockResolvedValueOnce({
      exists: true,
      id: receivablesItemsMocks[0].id,
      data: () => ({
        ...receivablesItemsMocks[0].data(),
      }),
    });

    const error = await receivableRepo
      .updateReceivable({
        receivableId: receivablesItemsMocks[0].id,
        receivableData: dataUpdate,
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
      id: receivablesItemsMocks[0].id,
      data: () => ({
        ...receivablesItemsMocks[0].data(),
      }),
    });

    await receivableRepo.deleteReceivable({
      id: receivablesItemsMocks[0].id,
      userId: 'a1b2c3d4-e5f6-7890-1234-56789abcdef5',
    });

    expect(firestore.doc().get).toHaveBeenCalledTimes(1);
    expect(firestore.doc().delete).toHaveBeenCalledTimes(1);
  });
});
