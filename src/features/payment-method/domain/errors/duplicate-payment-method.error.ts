import { DuplicateEntityError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export class DuplicatePaymentMethodError extends DuplicateEntityError {
  constructor(descriptionEnum: string) {
    super(ErrorCode.PAYMENT_METHOD_ALREADY_EXISTS, { descriptionEnum });
  }
}
