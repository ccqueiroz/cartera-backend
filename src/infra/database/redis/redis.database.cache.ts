import { CacheGateway } from '@/domain/Cache/gateway/cache.gateway';
import { LoggerGateway } from '@/domain/Helpers/gateway/logger.gateway';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ApiError } from '@/helpers/errors';
import { TypeOfClientRedis } from '@/packages/clients/redis';

export class RedisCache implements CacheGateway {
  private static instante: RedisCache;

  private constructor(
    private readonly clientRedis: TypeOfClientRedis,
    private readonly logger: LoggerGateway,
  ) {}

  public static create(clientRedis: TypeOfClientRedis, logger: LoggerGateway) {
    if (!RedisCache.instante) {
      RedisCache.instante = new RedisCache(clientRedis, logger);
    }

    return RedisCache.instante;
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
    return !!RedisCache.instante;
  }

  public async recover<T>(key: string): Promise<T | null> {
    const data = await this.clientRedis.get(key);

    if (!data) return null;

    return JSON.parse(data);
  }

  public async save<T>(key: string, data: T, ttl: number): Promise<void> {
    await this.clientRedis.set(key, JSON.stringify(data), { EX: ttl });
    //mapear as chaves relacionadas ao save para deleta-las.
  }

  public async delete(key: string): Promise<void> {
    await this.clientRedis.del(key);
  }
}
