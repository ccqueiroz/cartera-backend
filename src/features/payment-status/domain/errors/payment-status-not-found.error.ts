import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export class PaymentStatusNotFoundError extends EntityNotFoundError {
  constructor(code?: string) {
    super(ErrorCode.PAYMENT_STATUS_NOT_FOUND, code ? { code } : undefined);
  }
}
