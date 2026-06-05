import { SignoutUseCase } from './signout.usecase';

describe('SignoutUseCase', () => {
  it('revoga todos os refresh tokens do usuário', async () => {
    const authProvider = {
      revokeRefreshTokens: jest.fn(async () => undefined),
    } as any;
    const useCase = SignoutUseCase.create(authProvider);

    await useCase.execute({ userId: 'uid-1' });

    expect(authProvider.revokeRefreshTokens).toHaveBeenCalledWith('uid-1');
  });

  it('falha do provider propaga', async () => {
    const boom = new Error('provider caiu');
    const authProvider = {
      revokeRefreshTokens: jest.fn(async () => {
        throw boom;
      }),
    } as any;
    const useCase = SignoutUseCase.create(authProvider);

    await expect(useCase.execute({ userId: 'uid-1' })).rejects.toThrow(boom);
  });
});
