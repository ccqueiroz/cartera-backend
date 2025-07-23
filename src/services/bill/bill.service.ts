import {
  BillDTO,
  BillsPayableMonthInputDTO,
  CreateBillInputDTO,
  CreateBillOutputDTO,
  DeleteBillInputDTO,
  EditBillInputDTO,
  GetBillByIdInputDTO,
  GetBillsInputDTO,
} from '@/domain/Bill/dtos/bill.dto';
import { BillRepositoryGateway } from '@/domain/Bill/gateway/bill.repository.gateway';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';
import { CacheGateway } from '@/domain/Cache/gateway/cache.gateway';
import { ResponseListDTO } from '@/domain/dtos/responseListDto.dto';
import { GenerateHashGateway } from '@/domain/Helpers/gateway/generate-hash.gateway';

export class BillService implements BillServiceGateway {
  private static instance: BillService;
  private keyController = 'bill';
  private TTL_DEFAULT = 4 * 60; // 4 minutes;

  private constructor(
    private readonly db: BillRepositoryGateway,
    private readonly cache: CacheGateway,
    private readonly generateHashHelper: GenerateHashGateway,
  ) {}

  public static create(
    db: BillRepositoryGateway,
    cache: CacheGateway,
    generateHashHelper: GenerateHashGateway,
  ) {
    if (!BillService.instance) {
      BillService.instance = new BillService(db, cache, generateHashHelper);
    }

    return BillService.instance;
  }

  public async getBills(
    input: GetBillsInputDTO,
  ): Promise<ResponseListDTO<BillDTO>> {
    const generateHashFromInput = this.generateHashHelper.execute(input);

    const key = `${input.userId}:${this.keyController}-list-all-${
      generateHashFromInput ?? ''
    }`;

    const billsCache = await this.cache.recover<ResponseListDTO<BillDTO>>(key);

    if (billsCache && billsCache.content.length > 0) {
      return billsCache;
    }

    const billsDb = await this.db.getBills(input);

    if (billsDb.content.length > 0) {
      await this.cache.save<ResponseListDTO<BillDTO>>(
        key,
        billsDb,
        this.TTL_DEFAULT,
      );
    }

    return billsDb;
  }

  public async getBillById({
    id,
    userId,
  }: GetBillByIdInputDTO): Promise<BillDTO | null> {
    const key = `${userId}:${this.keyController}-list-by-id-${id}`;

    const billCache = await this.cache.recover<BillDTO>(key);

    if (billCache) {
      return billCache;
    }

    const billDb = await this.db.getBillById({ id, userId });

    if (billDb) {
      await this.cache.save<BillDTO>(key, billDb, this.TTL_DEFAULT);
    }

    return billDb;
  }

  public async createBill({
    billData,
    userId,
  }: Omit<
    CreateBillInputDTO,
    'createdAt'
  >): Promise<CreateBillOutputDTO | null> {
    const bill = await this.db.createBill({ billData, userId });

    if (bill?.id) {
      await this.cache.deleteWithPattern(
        `${userId}:${this.keyController}-list`,
      );
    }

    return bill;
  }

  public async updateBill({
    billId,
    billData,
    userId,
  }: EditBillInputDTO): Promise<BillDTO> {
    const bill = await this.db.updateBill({ billId, billData, userId });

    if (bill?.id) {
      await this.cache.deleteWithPattern(
        `${userId}:${this.keyController}-list`,
      );

      const keyToSave = `${userId}:${this.keyController}-bill-by-id-${bill.id}`;
      await this.cache.save<BillDTO>(keyToSave, bill, this.TTL_DEFAULT);
    }

    return bill;
  }

  public async deleteBill({ id, userId }: DeleteBillInputDTO): Promise<void> {
    await this.db.deleteBill({ id, userId });

    await this.cache.deleteWithPattern(`${userId}:${this.keyController}`);
  }

  public async billsPayableMonth({
    period,
    userId,
    page,
    size,
  }: BillsPayableMonthInputDTO): Promise<ResponseListDTO<BillDTO>> {
    const key = `${userId}:${this.keyController}-list-by-payable-month-${period.initialDate}-${period.finalDate}-${page}-${size}`;

    const billsCache = await this.cache.recover<ResponseListDTO<BillDTO>>(key);

    if (billsCache && billsCache.content.length > 0) {
      return billsCache;
    }

    const billsDb = await this.db.billsPayableMonth({
      period,
      userId,
      page,
      size,
    });

    if (billsDb.content.length > 0) {
      await this.cache.save<ResponseListDTO<BillDTO>>(
        key,
        billsDb,
        this.TTL_DEFAULT,
      );
    }

    return billsDb;
  }
}
