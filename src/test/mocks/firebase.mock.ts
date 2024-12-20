const mockFirestoreCollection = jest.fn();
const mockFirestoreWhere = jest.fn();
const mockFirestoreDoc = jest.fn();
const mockFirestoreGet = jest.fn();
const mockFirestoreAdd = jest.fn();
const mockFirestoreUpdate = jest.fn();
const mockFirestoreDelete = jest.fn();
const mockFirestoreOrderBy = jest.fn();

const mockFirestore = {
  collection: mockFirestoreCollection.mockReturnValue({
    doc: mockFirestoreDoc.mockReturnValue({
      get: mockFirestoreGet,
      update: mockFirestoreUpdate,
      delete: mockFirestoreDelete,
    }),
    get: mockFirestoreGet,
    where: mockFirestoreWhere.mockReturnValue({
      orderBy: mockFirestoreOrderBy.mockReturnValue({
        get: mockFirestoreGet,
      }),
      get: mockFirestoreGet,
    }),
    add: mockFirestoreAdd,
    orderBy: mockFirestoreOrderBy.mockReturnValue({
      get: mockFirestoreGet,
    }),
  }),
};

const firebase = {
  auth: jest.fn().mockReturnThis(),
  initializeApp: jest.fn().mockReturnThis(),
  firestore: jest.fn(() => mockFirestore),
};

export default firebase;

export {
  mockFirestoreCollection,
  mockFirestoreWhere,
  mockFirestoreGet,
  mockFirestoreAdd,
  mockFirestoreDoc,
  mockFirestoreUpdate,
  mockFirestoreDelete,
};
