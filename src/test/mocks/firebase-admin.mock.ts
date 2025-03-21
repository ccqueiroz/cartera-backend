const mockFirestoreCollection = jest.fn();
const mockFirestoreWhere = jest.fn();
const mockFirestoreDoc = jest.fn();
const mockFirestoreGet = jest.fn();
const mockFirestoreAdd = jest.fn();
const mockFirestoreUpdate = jest.fn();
const mockFirestoreDelete = jest.fn();
const mockFirestoreOrderBy = jest.fn();

const mockFirebaseAdmin = {
  credential: {
    cert: jest.fn().mockReturnValue('mock-cert'),
  },
  initializeApp: jest.fn(() => ({
    auth: jest.fn(() => mockAuth),
    firestore: jest.fn(() => mockFirestore),
  })),
};

const mockAuth = {
  getUser: jest.fn(),
  createUser: jest.fn(),
  verifyIdToken: jest.fn(),
  revokeRefreshTokens: jest.fn(),
  getUserByEmail: jest.fn(),
  deleteUser: jest.fn(),
  createCustomToken: jest.fn(),
};

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
};

export const auth = mockAuth;
export const firestore = mockFirestore;
export const credential = mockFirebaseAdmin.credential;
export const initializeApp = mockFirebaseAdmin.initializeApp;

export default mockFirebaseAdmin;
