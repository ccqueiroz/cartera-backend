import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { SignoutUseCase } from './signout.usecase';

let authGatewayMock: jest.Mocked<AuthGateway>;

describe('Signout Usecase', () => {
  let signOutUseCase: SignoutUseCase;

  beforeEach(() => {
    authGatewayMock = {
      signout: jest.fn(),
    } as any;

    signOutUseCase = SignoutUseCase.create(authGatewayMock);
  });

  it('should be create a instance of the SignoutUseCase class when will be use create method.', () => {
    expect(signOutUseCase).toBeInstanceOf(SignoutUseCase);
  });

  it('should call execute method when valid userId are provided', async () => {
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
