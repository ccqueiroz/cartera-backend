import { Scan } from '@/domain/Cache/dtos/cache.dto';
import { CacheGateway } from '@/domain/Cache/gateway/cache.gateway';
import { LoggerGateway } from '@/domain/Helpers/gateway/logger.gateway';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ApiError } from '@/helpers/errors';
import { TypeOfClientRedis } from '@/infra/database/redis/redis.database.cache';

export class RedisCacheRepository implements CacheGateway {
  private static instance: RedisCacheRepository;

  private constructor(
    private readonly clientRedis: TypeOfClientRedis,
    private readonly logger: LoggerGateway,
  ) {}

  public static create(clientRedis: TypeOfClientRedis, logger: LoggerGateway) {
    if (!RedisCacheRepository.instance) {
      RedisCacheRepository.instance = new RedisCacheRepository(
        clientRedis,
        logger,
      );
    }

    return RedisCacheRepository.instance;
  }

  private async handleErrorConnection(error?: Error) {
    const err = new ApiError(
      ERROR_MESSAGES.CACHE_CLIENT_ERROR,
      500,
      JSON.stringify(error, null, 2),
    );
    this.logger.error(
      `{[STATUS]: ${
        err.statusCode
      }}: ${`[DETAILS]: ${err?.details} - ${err.stack}`}`,
    );

    if (error && (error as any)?.code === 'ECONNREFUSED') {
      await this.quit();
    }
  }

  public async scan(cursor: number, pattern: string): Promise<Scan> {
    const result = await this.clientRedis.scan(cursor, { MATCH: pattern });
    return result;
  }

  public async connect(): Promise<void> {
    this.clientRedis.on('error', this.handleErrorConnection.bind(this));

    await this.clientRedis
      .connect()
      ?.then(() => this.logger.info('Redis running'));
  }

  public async disconnect(): Promise<void> {
    await this.clientRedis.disconnect();
  }

  public async quit(): Promise<void> {
    await this.clientRedis.quit();
  }

  public providerIsAlreadyConected() {
    return !!RedisCacheRepository.instance;
  }

  public async recover<T>(key: string): Promise<T | null> {
    const data = await this.clientRedis.get(key);

    if (!data) return null;

    return JSON.parse(data);
  }

  public async save<T>(key: string, data: T, ttl: number): Promise<void> {
    await this.clientRedis.set(key, JSON.stringify(data), { EX: ttl });
  }

  public async delete(key: string | Array<string>): Promise<void> {
    await this.clientRedis.del(key);
  }

  public async deleteWithPattern(pattern: string) {
    let cursor = 0;
    const keysToDelete: Array<string> = [];

    do {
      const { cursor: nextCursor, keys } = await this.scan(+cursor, pattern);

      cursor = Number(nextCursor);
      keysToDelete.push(...keys);
    } while (cursor !== 0);

    if (keysToDelete.length > 0) {
      await this.delete(keysToDelete);
    }
  }
}
