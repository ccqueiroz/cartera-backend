import mockFirebaseAdmin from '../mocks/firebase-admin.mock';
import { mockRedisClient } from '../mocks/redis.mock';

jest.mock('firebase-admin', () => ({
  __esModule: true,
  ...mockFirebaseAdmin,
}));

jest.mock('@redis/client', () => ({
  createClient: jest.fn(() => ({
    __esModule: true,
    ...mockRedisClient,
  })),
}));
