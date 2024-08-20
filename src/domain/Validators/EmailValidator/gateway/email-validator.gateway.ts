export interface EmailValidatorGateway {
  validate(email: string): boolean;
}
