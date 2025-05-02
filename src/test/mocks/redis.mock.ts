import { Scan } from '@/domain/Cache/dtos/cache.dto';
import { TypeOfClientRedis } from '@/infra/database/redis/redis.database.cache';

const mockRedisConnect = jest.fn();
const mockRedisOn = jest.fn();
const mockRedisDisconnect = jest.fn();
const mockRedisQuit = jest.fn();
const mockRedisGet = jest.fn<Promise<string | null>, [string]>();
const mockRedisSet = jest.fn<Promise<'OK'>, [string, string, any?]>();
const mockRedisDel = jest.fn<Promise<number>, [string | string[]]>();
const mockRedisScan = jest.fn<Promise<Scan>, [number, { MATCH: string }]>();

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
