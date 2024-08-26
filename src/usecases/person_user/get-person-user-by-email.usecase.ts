import { OutputDTO } from '@/domain/dtos/output.dto';
import { PersonUserEntitieDTO } from '@/domain/Person_User/dtos/person-user.dto';
import { Usecase } from '../usecase';
import { PersonUserGateway } from '@/domain/Person_User/gateway/person_user.gateway';
import { EmailValidatorGateway } from '@/domain/Validators/EmailValidator/gateway/email-validator.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

export type GetPersonUserByEmailInputDTO = Pick<PersonUserEntitieDTO, 'email'>;

export type GetPersonUserByEmailOutputDTO =
  OutputDTO<PersonUserEntitieDTO | null>;

export class GetPersonUserByEmailUseCase
  implements
    Usecase<GetPersonUserByEmailInputDTO, GetPersonUserByEmailOutputDTO>
{
  private constructor(
    private readonly personUserGateway: PersonUserGateway,
    private readonly emailValidatorGateway: EmailValidatorGateway,
  ) {}

  public static create({
    personUserGateway,
    emailValidatorGateway,
  }: {
    personUserGateway: PersonUserGateway;
    emailValidatorGateway: EmailValidatorGateway;
  }) {
    return new GetPersonUserByEmailUseCase(
      personUserGateway,
      emailValidatorGateway,
    );
  }

  public async execute({ email }: GetPersonUserByEmailInputDTO) {
    if (!this.emailValidatorGateway.validate(email)) {
      throw new ApiError(ERROR_MESSAGES.INVALID_EMAIL, 400);
    }

    const personUser = await this.personUserGateway.getUserByEmail({
      email,
    });

    return {
      data: personUser,
    };
  }
}
