import { EmailValidatorGateway } from '@/domain/Validators/EmailValidator/gateway/email-validator.gateway';
import { LoginUseCase } from './login.usecase';
import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';

let authGatewayMock: jest.Mocked<AuthGateway>;
let emailValidatorGatewayMock: jest.Mocked<EmailValidatorGateway>;

describe('Login Usecase', () => {
  let loginUseCase: LoginUseCase;

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

    loginUseCase = LoginUseCase.create(
      authGatewayMock,
      emailValidatorGatewayMock,
    );
  });

  it('should be create a instance of the LoginUseCase class when will be use create method.', () => {
    expect(loginUseCase).toBeInstanceOf(LoginUseCase);
  });

  it('should call execute method when valid email and password are provided', async () => {
    authGatewayMock.loginWithEmail.mockResolvedValue({
      email: 'jonh.doe@example.com',
      userId: 'P1fJ3',
      accessToken: 'accessToken-token-teste',
      refreshToken: 'refreshToken-token-teste',
      expirationTime: 1724708206117,
      lastLoginAt: 1724704559822,
    });

    emailValidatorGatewayMock.validate.mockReturnValue(true);

    const result = await loginUseCase.execute({
      email: 'jonh.doe@example.com',
      password: '12345670',
    });

    expect(authGatewayMock.loginWithEmail).toHaveBeenCalledWith({
      email: 'jonh.doe@example.com',
      password: '12345670',
    });

    expect(result.data.email).toBe('jonh.doe@example.com');
  });

  it('should call execute method when not valid email are provided', async () => {
    emailValidatorGatewayMock.validate.mockReturnValue(false);

    const error = await loginUseCase
      .execute({
        email: 'jonh.doe',
        password: '12345670',
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_EMAIL,
      statusCode: 400,
    });

    expect(authGatewayMock.loginWithEmail).not.toHaveBeenCalled();
  });

  it('should call execute method when not valid password are provided', async () => {
    emailValidatorGatewayMock.validate.mockReturnValue(true);

    const error = await loginUseCase
      .execute({
        email: 'jonh.doe@example.com',
        password: '',
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 401,
    });

    expect(authGatewayMock.loginWithEmail).not.toHaveBeenCalled();
  });
});
