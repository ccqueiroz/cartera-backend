import { EmailValidatorGateway } from '@/domain/Validators/EmailValidator/gateway/email-validator.gateway';
import { validatorsPackage } from '@/packages/validators';

export class EmailValidatorService implements EmailValidatorGateway {
  validate(email: string): boolean {
    return validatorsPackage.email({ email });
  }
}
