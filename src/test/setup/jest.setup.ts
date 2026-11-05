import mockFirebaseAdmin from '@/test/mocks/firebase-admin.mock';

jest.mock('firebase-admin', () => ({
  __esModule: true,
  ...mockFirebaseAdmin,
}));
