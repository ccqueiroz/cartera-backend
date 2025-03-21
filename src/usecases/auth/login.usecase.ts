import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { Usecase } from '../usecase';
import { AuthEntitieDTO, AuthSignDTO } from '@/domain/Auth/dtos/auth.dto';
import { EmailValidatorGateway } from '@/domain/Validators/EmailValidator/gateway/email-validator.gateway';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ApiError } from '@/helpers/errors';
import { OutputDTO } from '@/domain/dtos/output.dto';

export type LoginInputDTO = Omit<AuthSignDTO, 'updatedAt'>;

export type LoginOutputDTO = OutputDTO<
  Omit<AuthEntitieDTO, 'lastLoginAt' | 'createdAt' | 'updatedAt'>
>;

export class LoginUseCase implements Usecase<LoginInputDTO, LoginOutputDTO> {
  private constructor(
    private readonly authGateway: AuthGateway,
    private emailValidatorGateway: EmailValidatorGateway,
  ) {}

  public static create(
    authGateway: AuthGateway,
    emailValidatorGateway: EmailValidatorGateway,
  ) {
    return new LoginUseCase(authGateway, emailValidatorGateway);
  }

  public async execute({ email, password }: LoginInputDTO) {
    if (!this.emailValidatorGateway.validate(email)) {
      throw new ApiError(ERROR_MESSAGES.INVALID_EMAIL, 400);
    }

    if (!email || !password) {
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 401);
    }

    const userLogin = await this.authGateway.loginWithEmail({
      email,
      password,
    });

    return { data: { ...userLogin } };
  }
}
