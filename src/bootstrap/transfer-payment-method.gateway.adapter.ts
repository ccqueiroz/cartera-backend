import { PaymentMethodGateway } from '@/features/transfer/domain/ports/payment-method.gateway.port';
import { PaymentMethodRepository } from '@/features/payment-method/domain/ports/payment-method.repository.port';
import { PaymentMethodDescription } from '@/features/payment-method/domain/enums/payment-method-description.enum';

/**
 * Mora no bootstrap: transfer e payment-method não se importam — só o
 * composition root conhece os dois lados. `findActiveByEnum` já filtra por
 * catálogo ativo (deletedAt == null), então existir = ativo.
 */
export class TransferPaymentMethodGatewayAdapter
  implements PaymentMethodGateway
{
  private constructor(private readonly repository: PaymentMethodRepository) {}

  public static create(
    repository: PaymentMethodRepository,
  ): TransferPaymentMethodGatewayAdapter {
    return new TransferPaymentMethodGatewayAdapter(repository);
  }

  public async findActiveByEnum(
    descriptionEnum: string,
  ): Promise<{ isActive: boolean } | null> {
    const method = await this.repository.findActiveByEnum(
      descriptionEnum as PaymentMethodDescription,
    );
    if (!method) return null;
    return { isActive: method.isActive };
  }
}
