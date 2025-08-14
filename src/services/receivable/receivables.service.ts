import { CacheGateway } from '@/domain/Cache/gateway/cache.gateway';
import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';
import { GenerateHashGateway } from '@/domain/Helpers/gateway/generate-hash.gateway';
import {
  CreateReceivableInputDTO,
  CreateReceivableOutputDTO,
  DeleteReceivableInputDTO,
  EditReceivableInputDTO,
  GetReceivableByIdInputDTO,
  GetReceivablesInputDTO,
  QueryReceivablesByFilterInputDTO,
  ReceivableDTO,
  ReceivablesByMonthInputDTO,
} from '@/domain/Receivable/dtos/receivable.dto';
import { ReceivableRepositoryGateway } from '@/domain/Receivable/gateway/receivable.repository.gateway';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';

export class ReceivableService implements ReceivableServiceGateway {
  private static instance: ReceivableService;
  private keyController = 'receivable';
  private TTL_DEFAULT = 4 * 60; // 4 minutes;

  private constructor(
    private readonly db: ReceivableRepositoryGateway,
    private readonly cache: CacheGateway,
    private readonly generateHashHelper: GenerateHashGateway,
  ) {}

  public static create(
    db: ReceivableRepositoryGateway,
    cache: CacheGateway,
    generateHashHelper: GenerateHashGateway,
  ) {
    if (!ReceivableService.instance) {
      ReceivableService.instance = new ReceivableService(
        db,
        cache,
        generateHashHelper,
      );
    }

    return ReceivableService.instance;
  }

  public async getReceivables(
    input: GetReceivablesInputDTO,
  ): Promise<ResponseListDTO<ReceivableDTO>> {
    const generateHashFromInput = this.generateHashHelper.execute(input);

    const key = `${input.userId}:${this.keyController}-list-all-${
      generateHashFromInput ?? ''
    }`;

    const receivableCache = await this.cache.recover<
      ResponseListDTO<ReceivableDTO>
    >(key);

    if (receivableCache && receivableCache.content.length > 0) {
      return receivableCache;
    }

    const receivableDb = await this.db.getReceivables(input);

    if (receivableDb.content.length > 0) {
      await this.cache.save<ResponseListDTO<ReceivableDTO>>(
        key,
        receivableDb,
        this.TTL_DEFAULT,
      );
    }

    return receivableDb;
  }

  public async getReceivableById({
    id,
    userId,
  }: GetReceivableByIdInputDTO): Promise<ReceivableDTO | null> {
    const key = `${userId}:${this.keyController}-list-by-id-${id}`;

    const receivableCache = await this.cache.recover<ReceivableDTO>(key);

    if (receivableCache) {
      return receivableCache;
    }

    const receivableDb = await this.db.getReceivableById({ id, userId });

    if (receivableDb) {
      await this.cache.save<ReceivableDTO>(key, receivableDb, this.TTL_DEFAULT);
    }

    return receivableDb;
  }

  public async createReceivable({
    receivableData,
    userId,
  }: Omit<
    CreateReceivableInputDTO,
    'createdAt'
  >): Promise<CreateReceivableOutputDTO | null> {
    const receivable = await this.db.createReceivable({
      receivableData,
      userId,
    });

    if (receivable?.id) {
      await this.cache.deleteWithPattern(
        `${userId}:${this.keyController}-list*`,
      );
    }

    return receivable;
  }

  public async updateReceivable({
    receivableId,
    receivableData,
    userId,
  }: EditReceivableInputDTO): Promise<ReceivableDTO> {
    const receivable = await this.db.updateReceivable({
      receivableId,
      receivableData,
      userId,
    });

    if (receivable?.id) {
      await this.cache.deleteWithPattern(
        `${userId}:${this.keyController}-list*`,
      );

      const keyToSave = `${userId}:${this.keyController}-list-by-id-${receivable.id}`;
      await this.cache.save<ReceivableDTO>(
        keyToSave,
        receivable,
        this.TTL_DEFAULT,
      );
    }

    return receivable;
  }

  public async deleteReceivable({
    id,
    userId,
  }: DeleteReceivableInputDTO): Promise<void> {
    await this.db.deleteReceivable({ id, userId });

    await this.cache.deleteWithPattern(`${userId}:${this.keyController}*`);
  }

  public async receivablesByMonth({
    period,
    userId,
    page,
    size,
  }: ReceivablesByMonthInputDTO): Promise<ResponseListDTO<ReceivableDTO>> {
    const key = `${userId}:${this.keyController}-list-by-receivables-by-month-${period.initialDate}-${period.finalDate}-${page}-${size}`;

    const receivablesCache = await this.cache.recover<
      ResponseListDTO<ReceivableDTO>
    >(key);

    if (receivablesCache && receivablesCache.content.length > 0) {
      return receivablesCache;
    }

    const receivablesDb = await this.db.receivablesByMonth({
      period,
      userId,
      page,
      size,
    });

    if (receivablesDb.content.length > 0) {
      await this.cache.save<ResponseListDTO<ReceivableDTO>>(
        key,
        receivablesDb,
        this.TTL_DEFAULT,
      );
    }

    return receivablesDb;
  }
  private buildKeyToHandleQueryReceivablesByFilters({
    period,
    userId,
    filters,
  }: QueryReceivablesByFilterInputDTO) {
    const periodKey = period.exactlyDate
      ? `exactlyDate-${period.exactlyDate}`
      : `initialDate-${period.initialDate ?? 'null'}-finalDate-${
          period.finalDate ?? 'null'
        }`;

    const filterKey =
      filters && Object.keys(filters).length > 0
        ? Object.entries(filters)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => `${key}=${value}`)
            .join('&')
        : '';

    const key = `${userId}:${
      this.keyController
    }-list-receivables-by-filters-${periodKey}${
      filterKey ? `?${filterKey}` : ''
    }`;

    return key;
  }

  public async handleQueryReceivablesByFilters({
    period,
    userId,
    filters,
  }: QueryReceivablesByFilterInputDTO): Promise<
    ResponseListDTO<ReceivableDTO>
  > {
    const ttl = 2 * 60; // 2 minutes

    const key = this.buildKeyToHandleQueryReceivablesByFilters({
      period,
      userId,
      filters,
    });

    const receivablesCache = await this.cache.recover<
      ResponseListDTO<ReceivableDTO>
    >(key);

    if (receivablesCache && receivablesCache.content.length > 0) {
      return receivablesCache;
    }

    const receivablesDb = await this.db.handleQueryReceivablesByFilters({
      period,
      userId,
      filters,
    });

    if (receivablesDb.content.length > 0) {
      await this.cache.save<ResponseListDTO<ReceivableDTO>>(
        key,
        receivablesDb,
        ttl,
      );
    }

    return receivablesDb;
  }

  public totalAmountReceivables(receivables: Array<ReceivableDTO>): number {
    return this.db.totalAmountReceivables(receivables);
  }
}
