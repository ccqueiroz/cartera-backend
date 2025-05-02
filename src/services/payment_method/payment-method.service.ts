import { CacheGateway } from '@/domain/Cache/gateway/cache.gateway';
import { PaymentMethodRepositoryGateway } from './../../domain/Payment_Method/gateway/payment-method.repository.gateway';
import { PaymentMethodServiceGateway } from '@/domain/Payment_Method/gateway/payment-method.service.gateway';
import { PaymentMethodDTO } from '@/domain/Payment_Method/dtos/payment-method.dto';

export class PaymentMethodService implements PaymentMethodServiceGateway {
  private static instance: PaymentMethodService;
  private keyController = 'payment-method';
  private TTL = 10 * 60; // 10 minutes;

  private constructor(
    private readonly db: PaymentMethodRepositoryGateway,
    private readonly cache: CacheGateway,
  ) {}

  public static create(
    db: PaymentMethodRepositoryGateway,
    cache: CacheGateway,
  ) {
    if (!PaymentMethodService.instance) {
      PaymentMethodService.instance = new PaymentMethodService(db, cache);
    }

    return PaymentMethodService.instance;
  }

  public async getPaymentMethods(): Promise<Array<PaymentMethodDTO>> {
    const key = `${this.keyController}-list-all`;

    const paymentMethodCache = await this.cache.recover<
      Array<PaymentMethodDTO>
    >(key);

    if (Array.isArray(paymentMethodCache) && paymentMethodCache.length > 0) {
      return paymentMethodCache;
    }
    const paymentMethodDb = await this.db.getPaymentMethods();

    if (paymentMethodDb.length > 0) {
      await this.cache.save<Array<PaymentMethodDTO>>(
        key,
        paymentMethodDb,
        this.TTL,
      );
    }

    return paymentMethodDb;
  }

  public async getPaymentMethodById({
    id,
  }: Pick<PaymentMethodDTO, 'id'>): Promise<PaymentMethodDTO | null> {
    const key = `${this.keyController}-list-by-id-${id}`;

    const paymentMethodCache = await this.cache.recover<PaymentMethodDTO>(key);

    if (paymentMethodCache) {
      return paymentMethodCache;
    }

    const paymentMethod = await this.db.getPaymentMethodById({ id });

    if (paymentMethod) {
      await this.cache.save<PaymentMethodDTO>(key, paymentMethod, this.TTL);
    }

    return paymentMethod;
  }
}
