import { RecoverPasswordUseCase } from './recover-password.usecase';
import { UnauthorizedError } from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

describe('RecoverPasswordUseCase', () => {
  it('solicita o reset no provider', async () => {
    const authProvider = {
      sendPasswordResetEmail: jest.fn(async () => undefined),
    } as any;
    const useCase = RecoverPasswordUseCase.create(authProvider);

    await useCase.execute({ email: 'a@b.com' });

    expect(authProvider.sendPasswordResetEmail).toHaveBeenCalledWith('a@b.com');
  });

  it.each([
    ErrorCode.EMAIL_NOT_FOUND,
    ErrorCode.USER_NOT_FOUND,
    ErrorCode.ACCOUNT_NOT_FOUND,
  ])(
    'engole erro de existência de conta (%s) — anti-enumeração',
    async (code) => {
      const authProvider = {
        sendPasswordResetEmail: jest.fn(async () => {
          throw new UnauthorizedError(code);
        }),
      } as any;
      const useCase = RecoverPasswordUseCase.create(authProvider);

      await expect(
        useCase.execute({ email: 'ninguem@b.com' }),
      ).resolves.toBeUndefined();
    },
  );

  it('falha de infraestrutura atravessa', async () => {
    const authProvider = {
      sendPasswordResetEmail: jest.fn(async () => {
        throw new UnauthorizedError(ErrorCode.INTERNAL_SERVER_ERROR);
      }),
    } as any;
    const useCase = RecoverPasswordUseCase.create(authProvider);

    await expect(useCase.execute({ email: 'a@b.com' })).rejects.toMatchObject({
      code: ErrorCode.INTERNAL_SERVER_ERROR,
    });
  });
});
