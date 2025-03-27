import * as admin from 'firebase-admin';
import { HandleCanProgressToWritteOperationHelper } from './handle-can-progress-to-writte-operation.helpers';
import { dbFirestore } from '../database/firebase/firebase.database';
import { firestore } from '@/test/mocks/firebase-admin.mock';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ErrorsFirebase } from '../database/firebase/errorHandling';

let handleCanProgressToWritteOperationMock: HandleCanProgressToWritteOperationHelper;
let dbMock: admin.firestore.CollectionReference<
  admin.firestore.DocumentData,
  admin.firestore.DocumentData
>;

const userIdMock = 'mock-user-id-12345';

const responseMock = {
  id: 'mock-test-12345',
  data: () => ({
    userId: 'mock-user-id-12345',
  }),
};

describe('Handle Can Progress to Writte Helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    dbMock = dbFirestore.collection('collection-test');

    handleCanProgressToWritteOperationMock =
      new HandleCanProgressToWritteOperationHelper();
  });

  it('should finish the method without presenting errors when all parameters are passed correctly and call the search get method.', async () => {
    firestore.doc().get.mockResolvedValueOnce({
      exists: true,
      id: responseMock.id,
      data: () => ({
        ...responseMock.data(),
      }),
    });

    await expect(
      handleCanProgressToWritteOperationMock.execute(
        dbMock,
        responseMock.id,
        userIdMock,
      ),
    ).resolves.not.toThrow();
  });

  it('should be throw ApiError when the userId does not match with userId in document', async () => {
    firestore.doc().get.mockResolvedValueOnce({
      exists: true,
      id: responseMock.id,
      data: () => ({
        ...responseMock.data(),
      }),
    });

    await expect(
      handleCanProgressToWritteOperationMock.execute(
        dbMock,
        responseMock.id,
        'id-dont-match',
      ),
    ).rejects.toThrow(new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401));
  });

  it('should be throw ApiError when the document does not exist.', async () => {
    firestore.doc().get.mockResolvedValueOnce({
      exists: false,
    });

    await expect(
      handleCanProgressToWritteOperationMock.execute(
        dbMock,
        responseMock.id,
        userIdMock,
      ),
    ).rejects.toThrow(new ApiError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401));
  });

  it('should be throw ApiError when there is failure in request.', async () => {
    const error = new Error('Unexpected error');

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    firestore.doc().get.mockRejectedValueOnce(error);

    await expect(
      handleCanProgressToWritteOperationMock.execute(
        dbMock,
        responseMock.id,
        userIdMock,
      ),
    ).rejects.toThrow(error);
  });
});
