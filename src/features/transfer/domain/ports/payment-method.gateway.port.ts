/** Porta que a transferência usa para validar que a forma de pagamento está ativa no catálogo. */
export interface PaymentMethodGateway {
  findActiveByEnum(
    descriptionEnum: string,
  ): Promise<{ isActive: boolean } | null>;
}
