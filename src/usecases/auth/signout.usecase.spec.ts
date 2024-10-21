import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { SignoutUseCase } from './signout.usecase';

let authGatewayMock: jest.Mocked<AuthGateway>;

describe('Signout Usecase', () => {
  let signOutUseCase: SignoutUseCase;

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

    signOutUseCase = SignoutUseCase.create(authGatewayMock);
  });

  it('should be create a instance of the SignoutUseCase class when will be use create method.', () => {
    expect(signOutUseCase).toBeInstanceOf(SignoutUseCase);
  });

  it('should call signout when valid userId are provided', async () => {
    authGatewayMock.recoveryPassword.mockResolvedValue();

    await signOutUseCase.execute({
      userId: '1212121212',
    });

    expect(authGatewayMock.signout).toHaveBeenCalledWith({
      userId: '1212121212',
    });

    await expect(
      signOutUseCase.execute({
        userId: '1212121212',
      }),
    ).resolves.toBeUndefined();
  });
});
