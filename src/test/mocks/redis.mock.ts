import { Scan } from '@/shared/database/redis/cache.gateway';
import { TypeOfClientRedis } from '@/shared/database/redis/redis.client';

const mockRedisConnect = jest.fn();
const mockRedisOn = jest.fn();
const mockRedisDisconnect = jest.fn();
const mockRedisQuit = jest.fn();
const mockRedisGet = jest.fn<Promise<string | null>, [string]>();
const mockRedisSet = jest.fn<Promise<'OK'>, [string, string, any?]>();
const mockRedisDel = jest.fn<Promise<number>, [string | string[]]>();
const mockRedisScan = jest.fn<Promise<Scan>, [string, { MATCH: string }]>();

export const mockRedisClient = {
  connect: mockRedisConnect,
  disconnect: mockRedisDisconnect,
  quit: mockRedisQuit,
  on: mockRedisOn,
  get: mockRedisGet as jest.Mock<Promise<string | null>, [string]> & {
    mockResolvedValue: (value: string | null) => void;
  },
  set: mockRedisSet,
  del: mockRedisDel,
  scan: mockRedisScan,
  isOpen: false,
  isReady: false,
  commandOptions: jest.fn(),
} as unknown as TypeOfClientRedis & {
  get: jest.Mock;
  set: jest.Mock;
  del: jest.Mock;
  scan: jest.Mock;
};
