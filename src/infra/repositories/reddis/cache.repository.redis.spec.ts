import { mockRedisClient } from '@/test/mocks/redis.mock';
import { RedisCacheRepository } from './cache.repository.redis';
import { mockLogger } from '@/test/mocks/logger.mock';

describe('Cache Repository Redis', () => {
  let redisCacheRepository: RedisCacheRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    RedisCacheRepository['instance'] = null as any;
    redisCacheRepository = RedisCacheRepository.create(
      mockRedisClient,
      mockLogger,
    );
  });

  it('should be a singleton', () => {
    const newInstance = RedisCacheRepository.create(
      mockRedisClient as any,
      mockLogger as any,
    );

    expect(newInstance).toBe(redisCacheRepository);
  });

  it('should be connect and setup error handler', async () => {
    await redisCacheRepository.connect();

    expect(mockRedisClient.connect).toHaveBeenCalled();
    expect(mockRedisClient.on).toHaveBeenCalledWith(
      'error',
      expect.any(Function),
    );
  });

  it('should be disconnect Provider', async () => {
    await redisCacheRepository.disconnect();
    expect(mockRedisClient.disconnect).toHaveBeenCalled();
  });

  it('should be quit Provider', async () => {
    await redisCacheRepository.quit();
    expect(mockRedisClient.quit).toHaveBeenCalled();
  });

  it('should handle ECONNREFUSED and quit', async () => {
    const error = new Error('Connection refused') as any;
    error.code = 'ECONNREFUSED';

    await redisCacheRepository['handleErrorConnection'](error);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(mockRedisClient.quit).toHaveBeenCalled();
  });

  it('should return connection status', () => {
    expect(redisCacheRepository.providerIsAlreadyConected()).toBe(true);
  });

  it('should be return a data existending a bd provider', async () => {
    const data = { id: '1234567', description: 'test data' };
    const key = 'test-data';

    mockRedisClient.get.mockResolvedValue(JSON.stringify(data));

    const result = await redisCacheRepository.recover<typeof data>(key);

    expect(result).not.toBeNull();
    expect(typeof result).toEqual(typeof data);
    expect(result).toEqual(data);
    expect(mockRedisClient.get).toHaveBeenCalled();
    expect(mockRedisClient.get).toHaveBeenCalledWith(key);
  });

  it('should be return a null data when the key dont exist in bd provider', async () => {
    const key = 'test-data';

    mockRedisClient.get.mockResolvedValue(null);

    const result = await redisCacheRepository.recover(key);
    expect(result).toBeNull();
    expect(mockRedisClient.get).toHaveBeenCalled();
    expect(mockRedisClient.get).toHaveBeenCalledWith(key);
  });

  it('should be save the data called the "set" method of the provider', async () => {
    const data = { id: '1234567', description: 'test data' };
    const key = 'test-data';
    const ttl = 10000;

    await redisCacheRepository.save(key, data, ttl);

    expect(mockRedisClient.set).toHaveBeenCalled();
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      key,
      JSON.stringify(data),
      { EX: ttl },
    );
  });

  it('should be delete the data and key when called the "del" method of the provider', async () => {
    const key = 'test-data';

    await redisCacheRepository.delete(key);

    expect(mockRedisClient.del).toHaveBeenCalled();
    expect(mockRedisClient.del).toHaveBeenCalledWith(key);
  });

  it('should be list the keys with match the pattern to provider by param function', async () => {
    const pattern = 'test/*';

    mockRedisClient.scan.mockResolvedValueOnce({ cursor: 0, keys: ['test/1'] });

    await redisCacheRepository.scan(0, pattern);

    expect(mockRedisClient.scan).toHaveBeenCalledTimes(1);
    expect(mockRedisClient.scan).toHaveBeenCalledWith(0, { MATCH: pattern });
  });

  it('should be delete with pattern the keys when called deleteWithPattern.', async () => {
    const pattern = 'test/*';

    mockRedisClient.scan
      .mockResolvedValueOnce({ cursor: 20, keys: ['test/1'] })
      .mockResolvedValueOnce({ cursor: 10, keys: ['test/2'] })
      .mockResolvedValueOnce({ cursor: 0, keys: ['test/3'] });

    await redisCacheRepository.deleteWithPattern(pattern);

    expect(mockRedisClient.del).toHaveBeenCalledWith([
      'test/1',
      'test/2',
      'test/3',
    ]);
    expect(mockRedisClient.scan).toHaveBeenCalledTimes(3);
  });
});
