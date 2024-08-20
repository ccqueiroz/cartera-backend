import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { Usecase } from '../usecase';
import { PersonUserGateway } from '@/domain/Person_User/gateway/person_user.gateway';
import { AuthEntitieDTO, OutputDTO } from '@/domain/Auth/dtos/auth.dto';
import { EmailValidatorGateway } from '@/domain/Validators/EmailValidator/gateway/email-validator.gateway';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ApiError } from '@/helpers/errors';

export type RecoveryPasswordInputDTO = Pick<AuthEntitieDTO, 'email'>;

export type RecoveryPasswordOutputDTO = OutputDTO;

export class RecoveryPasswordUseCase
  implements Usecase<RecoveryPasswordInputDTO, RecoveryPasswordOutputDTO>
{
  private constructor(
    private readonly authGateway: AuthGateway,
    private readonly personUserGateway: PersonUserGateway,
    private emailValidatorGateway: EmailValidatorGateway,
  ) {}

  public static create(
    authGateway: AuthGateway,
    personUserGateway: PersonUserGateway,
    emailValidatorGateway: EmailValidatorGateway,
  ) {
    return new RecoveryPasswordUseCase(
      authGateway,
      personUserGateway,
      emailValidatorGateway,
    );
  }

  public async execute({
    email,
  }: RecoveryPasswordInputDTO): Promise<RecoveryPasswordOutputDTO> {
    if (!this.emailValidatorGateway.validate(email)) {
      throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
    }

    const hasUser = await this.personUserGateway.getUserByEmail({ email }); //check se existe usuário pelo e-mail

    if (!hasUser) throw new ApiError(ERROR_MESSAGES.USER_NOT_FOUND, 404);

    await this.authGateway.recoveryPassword({ email }); //envio do e-mail
    return { success: true };
  }
}
