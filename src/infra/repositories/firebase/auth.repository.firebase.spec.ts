import { authFirebase } from '../../database/firebase/firebase.database';
import { AuthRepositoryFirebase } from './auth.repository.firebase';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { convertOutputErrorToObject } from '@/helpers/convertOutputErrorToObject';
import { ErrorsFirebase } from '../../database/firebase/errorHandling';
import { auth } from '@/test/mocks/firebase-admin.mock';
import {
  refreshTokenUrl,
  ResetPasswordUrl,
  signInUrl,
} from '@/packages/clients/firebase';

describe('Auth Repository Firebase', () => {
  let authRepo: AuthRepositoryFirebase;

  const mockFetch = jest.fn();
  global.fetch = mockFetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';

    authRepo = AuthRepositoryFirebase.create(authFirebase);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.NODE_ENV = 'development';
    AuthRepositoryFirebase['instance'] = null as any;
  });

  it('should be register a user with email and password', async () => {
    auth.createUser.mockResolvedValue({
      toJSON: () => ({
        uid: '12345',
        email: 'jonh.doe@example.com',
        emailVerified: false,
        displayName: undefined,
        photoURL: undefined,
        phoneNumber: undefined,
        disabled: false,
        metadata: {
          lastSignInTime: null,
          creationTime: 'Thu, 20 Mar 2025 19:45:36 GMT',
          lastRefreshTime: null,
        },
        passwordHash: undefined,
        passwordSalt: undefined,
        customClaims: undefined,
        tokensValidAfterTime: 'Thu, 20 Mar 2025 19:45:36 GMT',
        tenantId: undefined,
        providerData: [
          {
            uid: 'jonh.doe@example.com',
            displayName: undefined,
            email: 'jonh.doe@example.com',
            photoURL: undefined,
            providerId: 'password',
            phoneNumber: undefined,
          },
        ],
      }),
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
      firstName: 'John',
      lastName: 'Doe',
      createdAt: expect.any(Number),
      updatedAt: null,
    });

    expect(auth.createUser).toHaveBeenCalledWith({
      email: 'jonh.doe@example.com',
      password: '121355',
    });
  });

  it('should be throw an error if user is not found during registration', async () => {
    const error = new ApiError('auth/user-not-found', 404);

    auth.createUser.mockRejectedValueOnce(error);

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

    expect(auth.createUser).toHaveBeenCalledWith({
      email: 'nonexistent@gmail.com',
      password: '121355',
    });
  });

  it('should throw a INTERNAL_SERVER_ERROR error if auth?.user is not present in registerWithEmail method', async () => {
    auth.createUser.mockResolvedValueOnce(null);

    const error = await authRepo
      .registerWithEmail({
        email: 'jonh.doe@example.com',
        password: '121355',
        firstName: 'John',
        lastName: 'Doe',
      })
      .catch((er) => er);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      statusCode: 500,
    });
  });

  it('should login a user with email and password', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          kind: 'kind',
          localId: '1234562',
          email: 'jonh.doe@example.com',
          displayName: '',
          idToken: 'access-token',
          registered: true,
          refreshToken: 'refresh-token',
          expiresIn: '3600',
        }),
    } as Response);

    const result = await authRepo.loginWithEmail({
      email: 'jonh.doe@example.com',
      password: '121355',
    });

    expect(result).toEqual({
      email: 'jonh.doe@example.com',
      userId: '1234562',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expirationTime: expect.any(Number),
    });

    expect(mockFetch).toHaveBeenCalledWith(signInUrl, {
      body: '{"email":"jonh.doe@example.com","password":"121355","returnSecureToken":true}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
  });

  it('should throw a INVALID_LOGIN_CREDENTIALS error if invalid credentials error occurs', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(null),
    } as Response);

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

  it('should throw a USER_NOT_FOUND error if user dont to be found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          error: {
            code: 400,
            message: 'INVALID_LOGIN_CREDENTIALS',
            errors: [],
          },
        }),
    } as Response);

    const error = await authRepo
      .loginWithEmail({
        email: 'jonh.doe@example.com',
        password: '121355',
      })
      .catch((er) => er);

    expect(convertOutputErrorToObject(error)).toEqual({
      message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      statusCode: 401,
    });
  });

  it('should send a password recovery email', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    await expect(
      authRepo.recoveryPassword({ email: 'jonh.doe@example.com' }),
    ).resolves.not.toThrow();

    expect(mockFetch).toHaveBeenCalledWith(ResetPasswordUrl, {
      body: '{"email":"jonh.doe@example.com","returnSecureToken":true}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
  });

  it('should revoke refresh tokens during signout', async () => {
    auth.revokeRefreshTokens.mockResolvedValue({});

    await authRepo.signout({ userId: '12345' });

    expect(auth.revokeRefreshTokens).toHaveBeenCalledWith('12345');
  });

  it('should delete a user by ID', async () => {
    auth.deleteUser.mockResolvedValue({});

    await authRepo.deleteUser({ userId: '12345' });

    expect(auth.deleteUser).toHaveBeenCalledWith('12345');
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
    auth.verifyIdToken.mockResolvedValue({
      uid: '12345',
      email: 'jonh.doe@example.com',
      exp: Date.now(),
    });

    const result = await authRepo.verifyToken({ accessToken: 'access-token' });

    expect(result).toEqual({
      email: 'jonh.doe@example.com',
      userId: '12345',
      expirationTime: expect.any(Number),
    });

    expect(auth.verifyIdToken).toHaveBeenCalledWith('access-token', true);
  });

  it('should create a new token for a user', async () => {
    auth.createCustomToken.mockResolvedValue('new-access-token');

    const result = await authRepo.createNewToken({ userId: '12345' });

    expect(result).toEqual({ accessToken: 'new-access-token' });
    expect(auth.createCustomToken).toHaveBeenCalledWith('12345');
  });

  it('should return user data if email is found', async () => {
    auth.getUserByEmail.mockResolvedValueOnce({
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
    auth.getUserByEmail.mockRejectedValueOnce({
      code: 'auth/user-not-found',
    });

    const result = await authRepo.getUserByEmail({
      email: 'not.found@gmail.com',
    });

    expect(result).toBeNull();
  });

  it('should throw an error if another type of Firebase error occurs', async () => {
    const error = new Error('Unexpected error');

    auth.getUserByEmail.mockRejectedValueOnce(error);

    jest.spyOn(ErrorsFirebase, 'presenterError').mockImplementation(() => {
      throw error;
    });

    await expect(
      authRepo.getUserByEmail({ email: 'error@example.com' }),
    ).rejects.toThrow(error);
  });

  it('should be call refreshToken method passed refreshToken param and return the new token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          kind: 'kind',
          user_id: '1234562',
          id_token: 'access-token',
          registered: true,
          refresh_token: 'refresh-token',
          expires_in: '3600',
        }),
    } as Response);

    const result = await authRepo.refreshToken({
      refreshToken: 'refres-token',
    });

    expect(result).toEqual({
      userId: '1234562',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expirationTime: expect.any(Number),
    });

    expect(mockFetch).toHaveBeenCalledWith(refreshTokenUrl, {
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: 'refres-token',
      }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
    });
  });
});
