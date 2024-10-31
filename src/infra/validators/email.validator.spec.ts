import { EmailValidatorService } from './email.validator';

describe('Email Validator', () => {
  let emailValidatorService: EmailValidatorService;

  beforeEach(() => {
    emailValidatorService = new EmailValidatorService();
  });

  it('should be create a instance of the EmailValidatorService class when it is instantiated.', () => {
    expect(emailValidatorService).toBeInstanceOf(EmailValidatorService);
  });

  it('should return true when call validate method when valid email are provided.', async () => {
    const result = emailValidatorService.validate('jonh.doe@example.com');

    expect(result).toBeTruthy();
  });

  it('should return false when call validate method when not valid email are provided.', async () => {
    const result = emailValidatorService.validate('jonh.doe');

    expect(result).toBeFalsy();
  });
});
