import {
  clientFireBase,
  clientFireBaseAdmin,
} from '@/packages/clients/firebase';
import { AuthRepositoryFirebase } from './auth.repository.firebase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ErrorsFirebase } from '../database/firebase/errorHandling';

describe('Auth Repository Firebase', () => {
  let authRepo: AuthRepositoryFirebase;
  let mockFirebaseAuth: jest.Mocked<any>;
  let mockAdminAuth: jest.Mocked<any>;

  beforeEach(() => {
    mockFirebaseAuth = {
      createUserWithEmailAndPassword: jest.fn(),
      signInWithEmailAndPassword: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
    };

    mockAdminAuth = {
      revokeRefreshTokens: jest.fn(),
      getUserByEmail: jest.fn(),
      deleteUser: jest.fn(),
      verifyIdToken: jest.fn(),
      createCustomToken: jest.fn(),
    };

    jest.spyOn(clientFireBase, 'auth').mockReturnValue(mockFirebaseAuth);
    jest.spyOn(clientFireBaseAdmin, 'auth').mockReturnValue(mockAdminAuth);

    authRepo = AuthRepositoryFirebase.create(
      clientFireBase.auth(),
      clientFireBaseAdmin,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be register a user with email and password', async () => {
    mockFirebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({
      user: {
        email: 'jonh.doe@example.com',
        uid: '12345',
        stsTokenManager: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expirationTime: Date.now(),
        },
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      },
    });

    const result = await authRepo.registerWithEmail({
      email: 'jonh.doe@example.com',
      password: '121355',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(result).toEqual({
      email: 'jonh.doe@example.com',
      userId: '12345',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expirationTime: expect.any(Number),
      firstName: 'John',
      lastName: 'Doe',
      createdAt: expect.any(Number),
      lastLoginAt: expect.any(Number),
    });

    expect(
      mockFirebaseAuth.createUserWithEmailAndPassword,
    ).toHaveBeenCalledWith('jonh.doe@example.com', '121355');
  });

  it('should be throw an error if user is not found during registration', async () => {
    const error = new ApiError('auth/user-not-found', 404);

    mockFirebaseAuth.createUserWithEmailAndPassword.mockRejectedValueOnce(
      error,
    );

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    await expect(
      authRepo.registerWithEmail({
        email: 'nonexistent@gmail.com',
        password: '121355',
        firstName: 'John',
        lastName: 'Doe',
      }),
    ).rejects.toThrow(ApiError);

    expect(
      mockFirebaseAuth.createUserWithEmailAndPassword,
    ).toHaveBeenCalledWith('nonexistent@gmail.com', '121355');
  });

  it('should throw a USER_NOT_FOUND error if auth?.user is not present in registerWithEmail method', async () => {
    mockFirebaseAuth.createUserWithEmailAndPassword.mockResolvedValueOnce(null);

    const error = await authRepo
      .registerWithEmail({
        email: 'jonh.doe@example.com',
        password: '121355',
        firstName: 'John',
        lastName: 'Doe',
      })
      .catch((er) => er);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.USER_NOT_FOUND,
      statusCode: 404,
    });
  });

  it('should login a user with email and password', async () => {
    mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValue({
      user: {
        email: 'jonh.doe@example.com',
        uid: '12345',
        stsTokenManager: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expirationTime: Date.now(),
        },
        lastLoginAt: Date.now(),
      },
    });

    const result = await authRepo.loginWithEmail({
      email: 'jonh.doe@example.com',
      password: '121355',
    });

    expect(result).toEqual({
      email: 'jonh.doe@example.com',
      userId: '12345',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expirationTime: expect.any(Number),
      lastLoginAt: expect.any(Number),
    });

    expect(mockFirebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      'jonh.doe@example.com',
      '121355',
    );
  });

  it('should throw a USER_NOT_FOUND error if auth?.user is not present in loginWithEmail method', async () => {
    mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValueOnce(null);

    const error = await authRepo
      .loginWithEmail({
        email: 'jonh.doe@example.com',
        password: '121355',
      })
      .catch((er) => er);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.USER_NOT_FOUND,
      statusCode: 404,
    });
  });

  it('should send a password recovery email', async () => {
    mockFirebaseAuth.sendPasswordResetEmail.mockResolvedValue({});

    await expect(
      authRepo.recoveryPassword({ email: 'jonh.doe@example.com' }),
    ).resolves.not.toThrow();

    expect(mockFirebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(
      'jonh.doe@example.com',
    );
  });

  it('should revoke refresh tokens during signout', async () => {
    mockAdminAuth.revokeRefreshTokens.mockResolvedValue({});

    await authRepo.signout({ userId: '12345' });

    expect(mockAdminAuth.revokeRefreshTokens).toHaveBeenCalledWith('12345');
  });

  it('should delete a user by ID', async () => {
    mockAdminAuth.deleteUser.mockResolvedValue({});

    await authRepo.deleteUser({ userId: '12345' });

    expect(mockAdminAuth.deleteUser).toHaveBeenCalledWith('12345');
  });

  it('should throw a MISSING_REQUIRED_PARAMETERS error if userId is not present in deleteUser method', async () => {
    const error = await authRepo
      .deleteUser({
        userId: null as unknown as string,
      })
      .catch((er) => er);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS,
      statusCode: 400,
    });
  });

  it('should verify an access token', async () => {
    mockAdminAuth.verifyIdToken.mockResolvedValue({
      uid: '12345',
      email: 'jonh.doe@example.com',
      exp: Date.now(),
    });

    const result = await authRepo.verifyToken({ accessToken: 'access-token' });

    expect(result).toEqual({
      email: 'jonh.doe@example.com',
      userId: '12345',
      expirationTime: expect.any(String),
    });

    expect(mockAdminAuth.verifyIdToken).toHaveBeenCalledWith(
      'access-token',
      true,
    );
  });

  it('should create a new token for a user', async () => {
    mockAdminAuth.createCustomToken.mockResolvedValue('new-access-token');

    const result = await authRepo.createNewToken({ userId: '12345' });

    expect(result).toEqual({ accessToken: 'new-access-token' });
    expect(mockAdminAuth.createCustomToken).toHaveBeenCalledWith('12345');
  });

  it('should return user data if email is found', async () => {
    mockAdminAuth.getUserByEmail.mockResolvedValueOnce({
      toJSON: () => ({
        email: 'jonh.doe@gmail.com',
        uid: '12345',
        metadata: { lastSignInTime: '2024-11-01T12:00:00Z' },
      }),
    });

    const result = await authRepo.getUserByEmail({
      email: 'jonh.doe@gmail.com',
    });

    expect(result).toEqual({
      email: 'jonh.doe@gmail.com',
      userId: '12345',
      lastLoginAt: '2024-11-01T12:00:00Z',
    });
  });

  it('should return null if the user is not found', async () => {
    mockAdminAuth.getUserByEmail.mockRejectedValueOnce({
      code: 'auth/user-not-found',
    });

    const result = await authRepo.getUserByEmail({
      email: 'not.found@gmail.com',
    });

    expect(result).toBeNull();
  });

  it('should throw an error if another type of Firebase error occurs', async () => {
    const error = new Error('Unexpected error');

    mockAdminAuth.getUserByEmail.mockRejectedValueOnce(error);

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    await expect(
      authRepo.getUserByEmail({ email: 'error@example.com' }),
    ).rejects.toThrow(error);
  });
});
