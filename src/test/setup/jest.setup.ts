import mockFirebaseAdmin from '../mocks/firebase-admin.mock';

jest.mock('firebase-admin', () => ({
  __esModule: true,
  ...mockFirebaseAdmin,
}));
