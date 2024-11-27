jest.mock('firebase', () => ({
  auth: jest.fn().mockReturnThis(),
  initializeApp: jest.fn().mockReturnThis(),
}));

jest.mock('firebase-admin', () => ({
  auth: jest.fn().mockReturnThis(),
  credential: {
    cert: jest.fn(),
  },
  initializeApp: jest.fn().mockReturnThis(),
}));
