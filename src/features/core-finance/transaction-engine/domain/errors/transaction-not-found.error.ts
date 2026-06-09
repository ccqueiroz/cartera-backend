import { EntityNotFoundError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

export class TransactionNotFoundError extends EntityNotFoundError {
  constructor() {
    super(ErrorCode.TRANSACTION_NOT_FOUND);
  }
}
