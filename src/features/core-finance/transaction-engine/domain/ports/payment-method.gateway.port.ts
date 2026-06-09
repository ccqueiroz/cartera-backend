export interface PaymentMethodGateway {
  isActive(descriptionEnum: string): Promise<boolean>;
}
