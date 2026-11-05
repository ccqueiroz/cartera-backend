import { RegisterAccountUseCase } from './register-account.usecase';

const SESSION = {
  userId: 'uid-1',
  email: 'a@b.com',
  accessToken: 'access',
  refreshToken: 'refresh',
  expirationTime: '2026-06-05T13:00:00.000Z',
};

const PERSON = {
  id: 'person-1',
  firstName: 'Ana',
  lastName: 'Souza',
  createdAt: '2026-06-05T12:00:00.000Z',
  updatedAt: null,
};

const makeAuthProvider = (overrides: Record<string, unknown> = {}) =>
  ({
    createAccount: jest.fn(async () => ({ userId: 'uid-1' })),
    signInWithPassword: jest.fn(async () => SESSION),
    deleteAccount: jest.fn(async () => undefined),
    ...overrides,
  } as any);

const makePersonGateway = (overrides: Record<string, unknown> = {}) =>
  ({
    create: jest.fn(async () => PERSON),
    findByUserIdIncludingDeleted: jest.fn(),
    ...overrides,
  } as any);

const INPUT = {
  email: 'a@b.com',
  password: 'secret',
  firstName: 'Ana',
  lastName: 'Souza',
};

describe('RegisterAccountUseCase', () => {
  it('creates account and person, auto-logs in and returns the merged output', async () => {
    const authProvider = makeAuthProvider();
    const personGateway = makePersonGateway();
    const useCase = RegisterAccountUseCase.create(authProvider, personGateway);

    const output = await useCase.execute(INPUT);

    expect(personGateway.create).toHaveBeenCalledWith({
      userId: 'uid-1',
      email: 'a@b.com',
      firstName: 'Ana',
      lastName: 'Souza',
    });
    expect(output).toEqual({
      email: 'a@b.com',
      userId: 'uid-1',
      firstName: 'Ana',
      lastName: 'Souza',
      fullName: 'Ana Souza',
      id: 'person-1',
      createdAt: '2026-06-05T12:00:00.000Z',
      updatedAt: null,
      accessToken: 'access',
      refreshToken: 'refresh',
      expirationTime: '2026-06-05T13:00:00.000Z',
    });
  });

  it('person creation failure compensates by deleting the account and rethrows', async () => {
    const boom = new Error('person falhou');
    const authProvider = makeAuthProvider();
    const personGateway = makePersonGateway({
      create: jest.fn(async () => {
        throw boom;
      }),
    });
    const useCase = RegisterAccountUseCase.create(authProvider, personGateway);

    await expect(useCase.execute(INPUT)).rejects.toThrow(boom);
    expect(authProvider.deleteAccount).toHaveBeenCalledWith('uid-1');
    expect(authProvider.signInWithPassword).not.toHaveBeenCalled();
  });

  it('auto-login failure does NOT undo anything - account and person persist', async () => {
    const boom = new Error('login falhou');
    const authProvider = makeAuthProvider({
      signInWithPassword: jest.fn(async () => {
        throw boom;
      }),
    });
    const personGateway = makePersonGateway();
    const useCase = RegisterAccountUseCase.create(authProvider, personGateway);

    await expect(useCase.execute(INPUT)).rejects.toThrow(boom);
    expect(authProvider.deleteAccount).not.toHaveBeenCalled();
  });

  it('seeds the wallet after the person (UC8/W5)', async () => {
    const authProvider = makeAuthProvider();
    const personGateway = makePersonGateway();
    const walletProvisionGateway = {
      provision: jest.fn(async () => undefined),
    };
    const useCase = RegisterAccountUseCase.create(
      authProvider,
      personGateway,
      walletProvisionGateway as never,
    );

    await useCase.execute(INPUT);

    expect(walletProvisionGateway.provision).toHaveBeenCalledWith({
      userId: 'uid-1',
    });
  });

  it('wallet seed failure is tolerated (registration completes, without compensation)', async () => {
    const authProvider = makeAuthProvider();
    const personGateway = makePersonGateway();
    const walletProvisionGateway = {
      provision: jest.fn(async () => {
        throw new Error('wallet seed falhou');
      }),
    };
    const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
    const useCase = RegisterAccountUseCase.create(
      authProvider,
      personGateway,
      walletProvisionGateway as never,
      logger as never,
    );

    const output = await useCase.execute(INPUT);

    expect(output.userId).toBe('uid-1');
    expect(authProvider.deleteAccount).not.toHaveBeenCalled();
    expect(authProvider.signInWithPassword).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });
});
