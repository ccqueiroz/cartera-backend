import {
  DuplicateEntityError,
  EntityNotFoundError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';
import { DuplicatePaymentMethodError } from './duplicate-payment-method.error';
import { PaymentMethodNotFoundError } from './payment-method-not-found.error';
import { PaymentMethodDeletedError } from './payment-method-deleted.error';

/**
 * O status HTTP é mapeado pelo ErrorMiddleware via a classe-base do kernel
 * (shared não pode importar erro de feature — fronteira shared-x->features).
 * Garantir a herança aqui equivale a garantir o mapeamento: EntityNotFound→404,
 * Duplicate→409. Deleted estende Duplicate por decisão de design (409).
 */
describe('PaymentMethod domain errors mapping contract', () => {
  it('PaymentMethodNotFoundError → EntityNotFoundError (404) com code próprio', () => {
    const error = new PaymentMethodNotFoundError('PIX');
    expect(error).toBeInstanceOf(EntityNotFoundError);
    expect(error.code).toBe(ErrorCode.PAYMENT_METHOD_NOT_FOUND);
  });

  it('DuplicatePaymentMethodError → DuplicateEntityError (409) com code próprio', () => {
    const error = new DuplicatePaymentMethodError('PIX');
    expect(error).toBeInstanceOf(DuplicateEntityError);
    expect(error.code).toBe(ErrorCode.PAYMENT_METHOD_ALREADY_EXISTS);
  });

  it('PaymentMethodDeletedError → DuplicateEntityError (409) com code próprio', () => {
    const error = new PaymentMethodDeletedError();
    expect(error).toBeInstanceOf(DuplicateEntityError);
    expect(error.code).toBe(ErrorCode.PAYMENT_METHOD_DELETED);
  });
});
