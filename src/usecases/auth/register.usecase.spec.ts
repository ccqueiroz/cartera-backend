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
      registerWithEmail: jest.fn(),
      getUserByEmail: jest.fn(),
    } as any;

    emailValidatorGatewayMock = {
      validate: jest.fn(),
    } as any;

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

  it('should call execute method when valid email, password, firstName and lastName are provided', async () => {
    authGatewayMock.registerWithEmail.mockResolvedValue({
      email: 'jonh.doe@example.com',
      userId: 'P1fJ3',
      createdAt: 1724704559822,
      firstName: 'jonh',
      lastName: 'doe',
      updatedAt: null,
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

  it('should call execute method when not valid email are provided', async () => {
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

  it('should call execute method when not valid password are provided', async () => {
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

  it('should call execute method when not valid firstName are provided', async () => {
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

  it('should call execute method when not valid lastName are provided', async () => {
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

  it('should call execute method when the user already exist.', async () => {
    emailValidatorGatewayMock.validate.mockReturnValue(true);

    authGatewayMock.getUserByEmail.mockResolvedValue({
      email: 'jonh.doe@example.com',
      userId: 'P1fJ3',
      lastLoginAt: 1724704559822,
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
