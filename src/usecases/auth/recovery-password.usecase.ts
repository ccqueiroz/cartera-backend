import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { Usecase } from '../usecase';
import { AuthEntitieDTO } from '@/domain/Auth/dtos/auth.dto';
import { EmailValidatorGateway } from '@/domain/Validators/EmailValidator/gateway/email-validator.gateway';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ApiError } from '@/helpers/errors';
import { GetPersonUserByEmailUseCase } from '@/usecases/person_user/get-person-user-by-email.usecase';

export type RecoveryPasswordInputDTO = Pick<AuthEntitieDTO, 'email'>;

export type RecoveryPasswordOutputDTO = Promise<void>;

export class RecoveryPasswordUseCase
  implements Usecase<RecoveryPasswordInputDTO, RecoveryPasswordOutputDTO>
{
  private constructor(
    private readonly authGateway: AuthGateway,
    private readonly getPersonUserByEmail: GetPersonUserByEmailUseCase,
    private emailValidatorGateway: EmailValidatorGateway,
  ) {}

  public static create(
    authGateway: AuthGateway,
    getPersonUserByEmail: GetPersonUserByEmailUseCase,
    emailValidatorGateway: EmailValidatorGateway,
  ) {
    return new RecoveryPasswordUseCase(
      authGateway,
      getPersonUserByEmail,
      emailValidatorGateway,
    );
  }

  public async execute({
    email,
  }: RecoveryPasswordInputDTO): Promise<RecoveryPasswordOutputDTO> {
    if (!this.emailValidatorGateway.validate(email)) {
      throw new ApiError(ERROR_MESSAGES.INVALID_EMAIL, 400);
    }

    const hasUser = await this.getPersonUserByEmail.execute({ email });

    if (!hasUser.data) throw new ApiError(ERROR_MESSAGES.USER_NOT_FOUND, 404);

    await this.authGateway.recoveryPassword({ email }); //envio do e-mail
  }
}
