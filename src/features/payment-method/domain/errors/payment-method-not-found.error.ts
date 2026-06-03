import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export class PaymentMethodNotFoundError extends EntityNotFoundError {
  constructor(identifier?: string) {
    super(
      ErrorCode.PAYMENT_METHOD_NOT_FOUND,
      identifier ? { descriptionEnum: identifier } : undefined,
    );
  }
}
