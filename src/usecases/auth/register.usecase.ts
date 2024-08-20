import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { Usecase } from '../usecase';
import {
  AuthEntitieDTO,
  AuthSignDTO,
  OutputDTO,
} from '@/domain/Auth/dtos/auth.dto';
import { EmailValidatorGateway } from '@/domain/Validators/EmailValidator/gateway/email-validator.gateway';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ApiError } from '@/helpers/errors';

export type RegisterUserInputDTO = AuthSignDTO;

export type RegisterUserOutputDTO = {
  data?: AuthEntitieDTO;
} & OutputDTO;

export class RegisterUserUseCase
  implements Usecase<RegisterUserInputDTO, RegisterUserOutputDTO>
{
  private constructor(
    private readonly authGateway: AuthGateway,
    private emailValidatorGateway: EmailValidatorGateway,
  ) {}

  public static create(
    authGateway: AuthGateway,
    emailValidatorGateway: EmailValidatorGateway,
  ) {
    return new RegisterUserUseCase(authGateway, emailValidatorGateway);
  }

  public async execute({ email, password }: RegisterUserInputDTO) {
    if (!this.emailValidatorGateway.validate(email)) {
      throw new ApiError(ERROR_MESSAGES.INVALID_EMAIL, 400);
    }

    const userLogin = await this.authGateway.registerWithEmail({
      email,
      password,
    });

    return { success: true, data: userLogin };
  }
}
