import {
  CreatePersonUserDTO,
  CreatePersonUserOutputDTO as TypeCreatePersonUserOutputDTO,
} from '@/domain/Person_User/dtos/person-user.dto';
import { Usecase } from '../usecase';
import { PersonUserGateway } from '@/domain/Person_User/gateway/person_user.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { EmailValidatorGateway } from '@/domain/Validators/EmailValidator/gateway/email-validator.gateway';
import { OutputDTO } from '@/domain/dtos/output.dto';

export type CreatePersonUserInputDTO = CreatePersonUserDTO;

export type CreatePersonUserOutputDTO =
  OutputDTO<TypeCreatePersonUserOutputDTO | null>;

export class CreatePersonUserUseCase
  implements Usecase<CreatePersonUserInputDTO, CreatePersonUserOutputDTO>
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
    return new CreatePersonUserUseCase(
      personUserGateway,
      emailValidatorGateway,
    );
  }

  public async execute({
    email,
    userId,
    firstName,
    lastName,
    createdAt,
  }: CreatePersonUserInputDTO) {
    if (!this.emailValidatorGateway.validate(email)) {
      throw new ApiError(ERROR_MESSAGES.INVALID_EMAIL, 400);
    }

    const hasPersonUser = await this.personUserGateway.getPersonUserByEmail({
      email,
    });

    if (hasPersonUser) {
      throw new ApiError(ERROR_MESSAGES.EMAIL_ALREADY_IN_USE, 400);
    }

    const personUser = await this.personUserGateway.createPersonUser({
      email,
      userId,
      firstName,
      lastName,
      createdAt,
    });

    return {
      data: {
        id: personUser?.id,
        fullName: personUser?.fullName,
      },
    };
  }
}
