const mockFirestoreCollection = jest.fn();
const mockFirestoreWhere = jest.fn();
const mockFirestoreGet = jest.fn();
const mockFirestoreAdd = jest.fn();

const mockFirestore = {
  collection: mockFirestoreCollection.mockReturnValue({
    where: mockFirestoreWhere.mockReturnValue({
      get: mockFirestoreGet,
    }),
    add: mockFirestoreAdd,
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
};
