import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { EmailValidatorGateway } from '@/domain/Validators/EmailValidator/gateway/email-validator.gateway';
import {
  GetPersonUserByEmailOutputDTO,
  GetPersonUserByEmailUseCase,
} from '../person_user/get-person-user-by-email.usecase';
import { RecoveryPasswordUseCase } from './recovery-password.usecase';
import { PersonUserEntitieDTO } from '@/domain/Person_User/dtos/person-user.dto';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';

let authGatewayMock: jest.Mocked<AuthGateway>;
let emailValidatorGatewayMock: jest.Mocked<EmailValidatorGateway>;
let getPersonUserByEmailUseCase: jest.Mocked<GetPersonUserByEmailUseCase>;

describe('Recovery Password Usecase', () => {
  let recoveryPasswordUseCase: RecoveryPasswordUseCase;

  beforeEach(() => {
    authGatewayMock = {
      recoveryPassword: jest.fn(),
    } as any;

    emailValidatorGatewayMock = {
      validate: jest.fn(),
    } as any;

    getPersonUserByEmailUseCase = {
      execute: jest.fn<
        Promise<{ data: PersonUserEntitieDTO | null }>,
        [GetPersonUserByEmailOutputDTO]
      >(),
    } as unknown as jest.Mocked<GetPersonUserByEmailUseCase>;

    recoveryPasswordUseCase = RecoveryPasswordUseCase.create(
      authGatewayMock,
      getPersonUserByEmailUseCase,
      emailValidatorGatewayMock,
    );
  });

  it('should be create a instance of the RecoveryPasswordUseCase class when will be use create method.', () => {
    expect(recoveryPasswordUseCase).toBeInstanceOf(RecoveryPasswordUseCase);
  });

  it('should call execute method when valid email are provided', async () => {
    authGatewayMock.recoveryPassword.mockResolvedValue();

    emailValidatorGatewayMock.validate.mockReturnValue(true);

    getPersonUserByEmailUseCase.execute.mockResolvedValue({
      data: {
        id: 'aBj98292',
        email: 'jonh.doe@example.com',
        firstName: 'jonh',
        lastName: 'doe',
        userId: '12121',
        createdAt: 12121212,
        updatedAt: 12121212,
        image: null,
        fullName: 'Jonh Doe',
      },
    });

    await recoveryPasswordUseCase.execute({
      email: 'jonh.doe@example.com',
    });

    expect(authGatewayMock.recoveryPassword).toHaveBeenCalledWith({
      email: 'jonh.doe@example.com',
    });

    await expect(
      recoveryPasswordUseCase.execute({
        email: 'jonh.doe@example.com',
      }),
    ).resolves.toBeUndefined();
  });

  it('should call execute method when not valid email are provided', async () => {
    emailValidatorGatewayMock.validate.mockReturnValue(false);

    const error = await recoveryPasswordUseCase
      .execute({
        email: 'jonh.doe',
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_EMAIL,
      statusCode: 400,
    });

    expect(authGatewayMock.recoveryPassword).not.toHaveBeenCalled();
  });

  it('should call execute method when valid email are provided but dont be found user', async () => {
    emailValidatorGatewayMock.validate.mockReturnValue(true);

    getPersonUserByEmailUseCase.execute.mockResolvedValue({
      data: null,
    });

    const error = await recoveryPasswordUseCase
      .execute({
        email: 'jonh.doe@example.com',
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.USER_NOT_FOUND,
      statusCode: 404,
    });

    expect(authGatewayMock.recoveryPassword).not.toHaveBeenCalled();
  });
});
