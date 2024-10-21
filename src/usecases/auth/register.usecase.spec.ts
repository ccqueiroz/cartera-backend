import { EmailValidatorGateway } from '@/domain/Validators/EmailValidator/gateway/email-validator.gateway';
import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { RegisterUserUseCase } from './register.usecase';
import {
  CreatePersonUserOutputDTO,
  CreatePersonUserUseCase,
} from '../person_user/create-person-user.usecase';
import { PersonUserEntitieDTO } from '@/domain/Person_User/dtos/person-user.dto';

let authGatewayMock: jest.Mocked<AuthGateway>;
let emailValidatorGatewayMock: jest.Mocked<EmailValidatorGateway>;
let createPersonUserUseCase: jest.Mocked<CreatePersonUserUseCase>;

describe('Register Usecase', () => {
  let registerUseCase: RegisterUserUseCase;

  beforeEach(() => {
    authGatewayMock = {
      loginWithEmail: jest.fn(),
      registerWithEmail: jest.fn(),
      recoveryPassword: jest.fn(),
      signout: jest.fn(),
      getUserByEmail: jest.fn(),
      deleteUser: jest.fn(),
      verifyToken: jest.fn(),
      createNewToken: jest.fn(),
    };

    emailValidatorGatewayMock = {
      validate: jest.fn(),
    };

    createPersonUserUseCase = {
      execute: jest.fn<
        Promise<{ data: PersonUserEntitieDTO | null }>,
        [CreatePersonUserOutputDTO]
      >(),
    } as unknown as jest.Mocked<CreatePersonUserUseCase>;

    registerUseCase = RegisterUserUseCase.create({
      authGateway: authGatewayMock,
      emailValidatorGateway: emailValidatorGatewayMock,
      createPersonUser: createPersonUserUseCase,
    });
  });

  it('should be create a instance of the RegisterUseCase class when will be use create method.', () => {
    expect(registerUseCase).toBeInstanceOf(RegisterUserUseCase);
  });

  it('should call registerWithEmail when valid email, password, firstName and lastName are provided', async () => {
    authGatewayMock.registerWithEmail.mockResolvedValue({
      email: 'jonh.doe@example.com',
      userId: 'P1fJ3',
      accessToken: 'accessToken-token-teste',
      refreshToken: 'refreshToken-token-teste',
      expirationTime: '1724708206117',
      lastLoginAt: '1724704559822',
      createdAt: '1724704559822',
      firstName: 'jonh',
      lastName: 'doe',
    });

    authGatewayMock.getUserByEmail.mockResolvedValue(null);

    emailValidatorGatewayMock.validate.mockReturnValue(true);

    createPersonUserUseCase.execute.mockResolvedValue({
      data: {
        id: '1212121212',
        fullName: 'jonh doe',
      },
    });

    const result = await registerUseCase.execute({
      email: 'jonh.doe@example.com',
      password: '12345670',
      firstName: 'jonh',
      lastName: 'doe',
    });

    expect(authGatewayMock.registerWithEmail).toHaveBeenCalledWith({
      email: 'jonh.doe@example.com',
      password: '12345670',
      firstName: 'jonh',
      lastName: 'doe',
    });

    expect(result.data.email).toBe('jonh.doe@example.com');
    expect(result.data.id).toBe('1212121212');
    expect(result.data.fullName).toBe('jonh doe');
  });

  it('should call registerWithEmail when not valid email are provided', async () => {
    emailValidatorGatewayMock.validate.mockReturnValue(false);

    const error = await registerUseCase
      .execute({
        email: '',
        password: '12345670',
        firstName: 'jonh',
        lastName: 'doe',
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_EMAIL,
      statusCode: 400,
    });

    expect(authGatewayMock.registerWithEmail).not.toHaveBeenCalled();
  });

  it('should call registerWithEmail when not valid password are provided', async () => {
    emailValidatorGatewayMock.validate.mockReturnValue(true);

    const error = await registerUseCase
      .execute({
        email: 'jonh.doe@example.com',
        password: '',
        firstName: 'jonh',
        lastName: 'doe',
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });

    expect(authGatewayMock.registerWithEmail).not.toHaveBeenCalled();
  });

  it('should call registerWithEmail when not valid firstName are provided', async () => {
    emailValidatorGatewayMock.validate.mockReturnValue(true);

    const error = await registerUseCase
      .execute({
        email: 'jonh.doe@example.com',
        password: '12345670',
        firstName: '',
        lastName: 'doe',
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });

    expect(authGatewayMock.registerWithEmail).not.toHaveBeenCalled();
  });

  it('should call registerWithEmail when not valid lastName are provided', async () => {
    emailValidatorGatewayMock.validate.mockReturnValue(true);

    const error = await registerUseCase
      .execute({
        email: 'jonh.doe@example.com',
        password: '12345670',
        firstName: 'jonh',
        lastName: '',
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });

    expect(authGatewayMock.registerWithEmail).not.toHaveBeenCalled();
  });

  it('should call registerWithEmail when the user already exist.', async () => {
    emailValidatorGatewayMock.validate.mockReturnValue(true);

    authGatewayMock.getUserByEmail.mockResolvedValue({
      email: 'jonh.doe@example.com',
      userId: 'P1fJ3',
      lastLoginAt: '1724704559822',
    });

    const error = await registerUseCase
      .execute({
        email: 'jonh.doe@example.com',
        password: '12345670',
        firstName: 'jonh',
        lastName: 'doe',
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.EMAIL_ALREADY_IN_USE,
      statusCode: 400,
    });

    expect(authGatewayMock.registerWithEmail).not.toHaveBeenCalled();
  });
});
