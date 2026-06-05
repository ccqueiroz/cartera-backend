import { LoginUseCase } from './login.usecase';
import {
  ForbiddenError,
  UnauthorizedError,
} from '@/shared/kernel/errors/domain.error';
import { ErrorCode } from '@/shared/kernel/errors/error-code';

const SESSION = {
  userId: 'uid-1',
  email: 'a@b.com',
  accessToken: 'access',
  refreshToken: 'refresh',
  expirationTime: '2026-06-05T13:00:00.000Z',
};

const makeAuthProvider = (overrides: Record<string, unknown> = {}) =>
  ({
    signInWithPassword: jest.fn(async () => SESSION),
    ...overrides,
  } as any);

const makePersonGateway = (overrides: Record<string, unknown> = {}) =>
  ({
    findByUserIdIncludingDeleted: jest.fn(async () => null),
    ...overrides,
  } as any);

const INPUT = { email: 'a@b.com', password: 'secret' };

describe('LoginUseCase', () => {
  it('devolve a sessão no sucesso sem consultar o person (caminho quente)', async () => {
    const personGateway = makePersonGateway();
    const useCase = LoginUseCase.create(makeAuthProvider(), personGateway);

    const session = await useCase.execute(INPUT);

    expect(session).toEqual(SESSION);
    expect(personGateway.findByUserIdIncludingDeleted).not.toHaveBeenCalled();
  });

  it('credencial errada propaga INVALID_CREDENTIALS sem lookup', async () => {
    const authProvider = makeAuthProvider({
      signInWithPassword: jest.fn(async () => {
        throw new UnauthorizedError(ErrorCode.INVALID_CREDENTIALS);
      }),
    });
    const personGateway = makePersonGateway();
    const useCase = LoginUseCase.create(authProvider, personGateway);

    await expect(useCase.execute(INPUT)).rejects.toMatchObject({
      code: ErrorCode.INVALID_CREDENTIALS,
    });
    expect(personGateway.findByUserIdIncludingDeleted).not.toHaveBeenCalled();
  });

  it('conta desativada com person soft-deletado vira ACCOUNT_DELETED (terminal)', async () => {
    const authProvider = makeAuthProvider({
      signInWithPassword: jest.fn(async () => {
        throw new ForbiddenError(ErrorCode.USER_DISABLED, {
          userId: 'uid-deleted',
        });
      }),
    });
    const personGateway = makePersonGateway({
      findByUserIdIncludingDeleted: jest.fn(async () => ({
        deletedAt: '2026-06-01T00:00:00.000Z',
      })),
    });
    const useCase = LoginUseCase.create(authProvider, personGateway);

    await expect(useCase.execute(INPUT)).rejects.toMatchObject({
      code: ErrorCode.ACCOUNT_DELETED,
    });
    expect(personGateway.findByUserIdIncludingDeleted).toHaveBeenCalledWith(
      'uid-deleted',
    );
  });

  it('conta desativada sem soft-delete segue USER_DISABLED (suspensão)', async () => {
    const authProvider = makeAuthProvider({
      signInWithPassword: jest.fn(async () => {
        throw new ForbiddenError(ErrorCode.USER_DISABLED, {
          userId: 'uid-suspended',
        });
      }),
    });
    const personGateway = makePersonGateway({
      findByUserIdIncludingDeleted: jest.fn(async () => ({ deletedAt: null })),
    });
    const useCase = LoginUseCase.create(authProvider, personGateway);

    await expect(useCase.execute(INPUT)).rejects.toMatchObject({
      code: ErrorCode.USER_DISABLED,
    });
  });

  it('conta desativada sem uid no erro segue USER_DISABLED sem lookup', async () => {
    const authProvider = makeAuthProvider({
      signInWithPassword: jest.fn(async () => {
        throw new ForbiddenError(ErrorCode.USER_DISABLED);
      }),
    });
    const personGateway = makePersonGateway();
    const useCase = LoginUseCase.create(authProvider, personGateway);

    await expect(useCase.execute(INPUT)).rejects.toMatchObject({
      code: ErrorCode.USER_DISABLED,
    });
    expect(personGateway.findByUserIdIncludingDeleted).not.toHaveBeenCalled();
  });

  it('person inexistente no caminho frio segue USER_DISABLED', async () => {
    const authProvider = makeAuthProvider({
      signInWithPassword: jest.fn(async () => {
        throw new ForbiddenError(ErrorCode.USER_DISABLED, {
          userId: 'uid-ghost',
        });
      }),
    });
    const personGateway = makePersonGateway({
      findByUserIdIncludingDeleted: jest.fn(async () => null),
    });
    const useCase = LoginUseCase.create(authProvider, personGateway);

    await expect(useCase.execute(INPUT)).rejects.toMatchObject({
      code: ErrorCode.USER_DISABLED,
    });
  });
});
