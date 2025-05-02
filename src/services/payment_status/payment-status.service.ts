import { CacheGateway } from '@/domain/Cache/gateway/cache.gateway';
import { PaymentStatusDTO } from '@/domain/Payment_Status/dtos/payment-status.dto';
import { PaymentStatusRepositoryGateway } from '@/domain/Payment_Status/gateway/payment-status.respository.gateway';
import { PaymentStatusServiceGateway } from '@/domain/Payment_Status/gateway/payment-status.service.gateway';

export class PaymentStatusService implements PaymentStatusServiceGateway {
  private static instance: PaymentStatusService;
  private keyController = 'payment-status';
  private TTL = 10 * 60; // 10 minutes;

  private constructor(
    private readonly db: PaymentStatusRepositoryGateway,
    private readonly cache: CacheGateway,
  ) {}

  public static create(
    db: PaymentStatusRepositoryGateway,
    cache: CacheGateway,
  ) {
    if (!PaymentStatusService.instance) {
      PaymentStatusService.instance = new PaymentStatusService(db, cache);
    }

    return PaymentStatusService.instance;
  }

  public async getPaymentStatus(): Promise<Array<PaymentStatusDTO>> {
    const key = `${this.keyController}-list-all`;

    const paymentStatusCache = await this.cache.recover<
      Array<PaymentStatusDTO>
    >(key);

    if (Array.isArray(paymentStatusCache) && paymentStatusCache.length > 0) {
      return paymentStatusCache;
    }
    const paymentStatusDb = await this.db.getPaymentStatus();

    if (paymentStatusDb.length > 0) {
      await this.cache.save<Array<PaymentStatusDTO>>(
        key,
        paymentStatusDb,
        this.TTL,
      );
    }

    return paymentStatusDb;
  }

  public async getPaymentStatusById({
    id,
  }: Pick<PaymentStatusDTO, 'id'>): Promise<PaymentStatusDTO | null> {
    const key = `${this.keyController}-list-by-id-${id}`;

    const paymentStatusCache = await this.cache.recover<PaymentStatusDTO>(key);

    if (paymentStatusCache) {
      return paymentStatusCache;
    }

    const paymentStatus = await this.db.getPaymentStatusById({ id });

    if (paymentStatus) {
      await this.cache.save<PaymentStatusDTO>(key, paymentStatus, this.TTL);
    }

    return paymentStatus;
  }
}
