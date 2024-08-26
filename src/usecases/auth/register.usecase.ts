import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { AuthEntitieDTO, AuthRegisterDTO } from '@/domain/Auth/dtos/auth.dto';
import { EmailValidatorGateway } from '@/domain/Validators/EmailValidator/gateway/email-validator.gateway';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ApiError } from '@/helpers/errors';
import { OutputDTO } from '@/domain/dtos/output.dto';
import { CreatePersonUserUseCase } from '@/usecases/person_user/create-person-user.usecase';
import { Usecase } from '../usecase';

export type RegisterUserInputDTO = AuthRegisterDTO;

export type RegisterUserOutputDTO = OutputDTO<AuthEntitieDTO | null>;

export class RegisterUserUseCase
  implements Usecase<RegisterUserInputDTO, RegisterUserOutputDTO>
{
  private constructor(
    private readonly authGateway: AuthGateway,
    private emailValidatorGateway: EmailValidatorGateway,
    private readonly createPersonUser: CreatePersonUserUseCase,
  ) {}

  public static create({
    authGateway,
    emailValidatorGateway,
    createPersonUser,
  }: {
    authGateway: AuthGateway;
    emailValidatorGateway: EmailValidatorGateway;
    createPersonUser: CreatePersonUserUseCase;
  }) {
    return new RegisterUserUseCase(
      authGateway,
      emailValidatorGateway,
      createPersonUser,
    );
  }

  public async execute({
    email,
    password,
    firstName,
    lastName,
  }: RegisterUserInputDTO) {
    if (!this.emailValidatorGateway.validate(email)) {
      throw new ApiError(ERROR_MESSAGES.INVALID_EMAIL, 400);
    }

    if (!email || !password || !firstName || !lastName)
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);

    const hasUser = await this.authGateway.getUserByEmail({ email });

    if (hasUser) {
      throw new ApiError(ERROR_MESSAGES.EMAIL_ALREADY_IN_USE, 400);
    }

    const userLogin = await this.authGateway.registerWithEmail({
      email,
      password,
      firstName,
      lastName,
    });

    try {
      const createUser = await this.createPersonUser.execute({
        email: userLogin.email,
        firstName,
        lastName,
        userId: userLogin.userId,
        createdAt: userLogin.createdAt,
      });

      return { data: { ...userLogin, ...createUser.data } };
    } catch (error) {
      await this.authGateway.deleteUser({ userId: userLogin.userId });
      throw new ApiError(ERROR_MESSAGES.CREATE_PERSON_USER_FAILED, 500);
    }
  }
}
