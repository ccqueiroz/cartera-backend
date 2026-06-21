import { PaymentMethodGateway } from '@/features/core-finance/transaction-engine/domain/ports/payment-method.gateway.port';
import { PaymentMethodRepository } from '@/features/payment-method/domain/ports/payment-method.repository.port';
import { PaymentMethodDescription } from '@/features/payment-method/domain/enums/payment-method-description.enum';

/**
 * Mora no bootstrap: o motor (core-finance) e payment-method não se importam.
 * `findActiveByEnum` já filtra catálogo ativo (deletedAt == null) → existir = ativo.
 */
export class CoreFinancePaymentMethodGatewayAdapter
  implements PaymentMethodGateway
{
  private constructor(private readonly repository: PaymentMethodRepository) {}

  public static create(
    repository: PaymentMethodRepository,
  ): CoreFinancePaymentMethodGatewayAdapter {
    return new CoreFinancePaymentMethodGatewayAdapter(repository);
  }

  public async isActive(descriptionEnum: string): Promise<boolean> {
    const method = await this.repository.findActiveByEnum(
      descriptionEnum as PaymentMethodDescription,
    );
    return method !== null;
  }
}
