import { DuplicateEntityError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

/**
 * Estende DuplicateEntityError (→ 409) porque o ErrorMiddleware vive em `shared`
 * e não pode importar erros de feature (fronteira shared-x->features): o status
 * só pode ser mapeado pela classe-base do kernel. 409 = conflito ao operar sobre
 * um recurso já excluído (design decision 5/open question: 409 sobre 410).
 */
export class PaymentMethodDeletedError extends DuplicateEntityError {
  constructor() {
    super(ErrorCode.PAYMENT_METHOD_DELETED);
  }
}
