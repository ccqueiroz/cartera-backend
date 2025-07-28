import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { RefreshTokenUseCase } from './refresh-token.usecase';
import { ApiError } from '@/helpers/errors';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';

let authGatewayMock: jest.Mocked<AuthGateway>;
let refreshTokenUsecaseMock: RefreshTokenUseCase;

describe('Refresh Token Usecase', () => {
  beforeEach(() => {
    authGatewayMock = {
      refreshToken: jest.fn(),
    } as any;

    refreshTokenUsecaseMock = RefreshTokenUseCase.create(authGatewayMock);
  });

  it('should be create a instance of the RefreshTokenUseCase class when will be use create method.', () => {
    expect(refreshTokenUsecaseMock).toBeInstanceOf(RefreshTokenUseCase);
  });

  it('should call execute method when valid refreshtoken is provided', async () => {
    authGatewayMock.refreshToken.mockResolvedValue({
      userId: 'P1fJ3',
      accessToken: 'accessToken-token-teste',
      refreshToken: 'refreshToken-token-teste',
      expirationTime: 1724708206117,
    });

    const result = await refreshTokenUsecaseMock.execute({
      refreshToken: 'refresh-token',
    });

    expect(authGatewayMock.refreshToken).toHaveBeenCalledWith({
      refreshToken: 'refresh-token',
    });

    expect(result.data.accessToken).toBe('accessToken-token-teste');
  });

  it('should call execute method when refreshtoken doesnt provided', async () => {
    const error = await refreshTokenUsecaseMock
      .execute({
        refreshToken: undefined as any,
      })
      .catch((er) => er);

    expect(error).toBeInstanceOf(ApiError);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 403,
    });

    expect(authGatewayMock.refreshToken).not.toHaveBeenCalled();
  });
});
