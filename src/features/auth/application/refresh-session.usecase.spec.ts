import { RefreshSessionUseCase } from './refresh-session.usecase';
import { UnauthorizedError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

describe('RefreshSessionUseCase', () => {
  it('troca o refresh token e devolve a nova sessão', async () => {
    const refreshed = {
      userId: 'uid-1',
      accessToken: 'novo-access',
      refreshToken: 'novo-refresh',
      expirationTime: '2026-06-05T13:00:00.000Z',
    };
    const authProvider = {
      refreshSession: jest.fn(async () => refreshed),
    } as any;
    const useCase = RefreshSessionUseCase.create(authProvider);

    const session = await useCase.execute({ refreshToken: 'antigo' });

    expect(session).toEqual(refreshed);
    expect(authProvider.refreshSession).toHaveBeenCalledWith({
      refreshToken: 'antigo',
    });
  });

  it('token inválido/revogado propaga UnauthorizedError(INVALID_TOKEN)', async () => {
    const authProvider = {
      refreshSession: jest.fn(async () => {
        throw new UnauthorizedError(ErrorCode.INVALID_TOKEN);
      }),
    } as any;
    const useCase = RefreshSessionUseCase.create(authProvider);

    await expect(
      useCase.execute({ refreshToken: 'revogado' }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_TOKEN });
  });
});
