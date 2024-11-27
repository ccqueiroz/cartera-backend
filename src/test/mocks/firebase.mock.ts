jest.mock('firebase', () => ({
  auth: jest.fn().mockReturnThis(),
  initializeApp: jest.fn().mockReturnThis(),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        get: jest.fn(),
      })),
      add: jest.fn(),
    })),
  })),
}));

jest.mock('firebase-admin', () => ({
  auth: jest.fn().mockReturnThis(),
  credential: {
    cert: jest.fn(),
  },
  initializeApp: jest.fn().mockReturnThis(),
}));
