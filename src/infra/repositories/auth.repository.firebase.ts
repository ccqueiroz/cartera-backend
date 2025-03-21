import * as admin from 'firebase-admin';
import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import {
  AuthSignDTO,
  AuthEntitieDTO,
  AuthRegisterDTO,
} from '@/domain/Auth/dtos/auth.dto';
import { AuthEntitie } from '@/domain/Auth/entitie/auth.entitie';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ErrorsFirebase } from '../database/firebase/errorHandling';
import {
  ResetPasswordUrl,
  signInUrl,
} from '@/packages/clients/firebase/urlToAuthFirebase';
export class AuthRepositoryFirebase implements AuthGateway {
  private static instance: AuthRepositoryFirebase;

  private constructor(private readonly auth: admin.auth.Auth) {}

  public static create(auth: admin.auth.Auth) {
    if (!AuthRepositoryFirebase.instance) {
      AuthRepositoryFirebase.instance = new AuthRepositoryFirebase(auth);
    }
    return AuthRepositoryFirebase.instance;
  }

  private async handleUseAuthUrl<T>(url: string, body: T) {
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          ...body,
          returnSecureToken: true,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data?.error?.code) {
        throw new ApiError(data?.error?.message, data?.error?.code);
      }

      return data;
    } catch (error) {
      return ErrorsFirebase.presenterError(error as unknown as object);
    }
  }

  public async registerWithEmail({
    email,
    password,
    firstName,
    lastName,
  }: Omit<AuthRegisterDTO, 'createdAt' | 'updatedAt'>): Promise<
    Omit<
      AuthEntitieDTO,
      'accessToken' | 'refreshToken' | 'expirationTime' | 'lastLoginAt'
    >
  > {
    const auth = await this.auth
      .createUser({ email, password })
      .then((response) => response.toJSON())
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    if (!auth) throw new ApiError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 500);

    const data = JSON.parse(JSON.stringify(auth) as unknown as string);

    const authEntitie = AuthEntitie.with({
      email: data.email,
      userId: data.uid,
      accessToken: '',
      refreshToken: '',
      expirationTime: null,
      lastLoginAt: 0,
      createdAt: new Date(data.metadata.creationTime).getTime(),
      updatedAt: null,
      firstName,
      lastName,
    });

    return {
      email: authEntitie.email,
      userId: authEntitie.userId,
      firstName: authEntitie.firstName,
      lastName: authEntitie.lastName,
      createdAt: authEntitie.createdAt,
      updatedAt: null,
    };
  }

  public async loginWithEmail({
    email,
    password,
  }: Omit<AuthSignDTO, 'updatedAt'>): Promise<
    Omit<AuthEntitieDTO, 'lastLoginAt' | 'createdAt' | 'updatedAt'>
  > {
    const data = await this.handleUseAuthUrl(signInUrl, { email, password });

    if (!data) throw new ApiError(ERROR_MESSAGES.USER_NOT_FOUND, 404);

    const authEntitie = AuthEntitie.with({
      email: data.email,
      userId: data.localId,
      accessToken: data?.idToken,
      refreshToken: data?.refreshToken,
      expirationTime: new Date().getTime() + +data?.expiresIn,
      lastLoginAt: 0,
      updatedAt: null,
      createdAt: data?.createdAt,
    });

    return {
      email: authEntitie.email,
      userId: authEntitie.userId,
      accessToken: authEntitie.accessToken,
      refreshToken: authEntitie.refreshToken,
      expirationTime: authEntitie.expirationTime,
    };
  }

  public async recoveryPassword({
    email,
  }: Pick<AuthEntitieDTO, 'email'>): Promise<void> {
    await this.handleUseAuthUrl(ResetPasswordUrl, { email });
  }

  public async signout({
    userId,
  }: Pick<AuthEntitieDTO, 'userId'>): Promise<void> {
    await this.auth.revokeRefreshTokens(userId).catch((error) => {
      ErrorsFirebase.presenterError(error);
    });
  }

  public async getUserByEmail({
    email,
  }: Pick<AuthEntitieDTO, 'email'>): Promise<Pick<
    AuthEntitieDTO,
    'email' | 'userId' | 'lastLoginAt'
  > | null> {
    const authUser = (await this.auth
      .getUserByEmail(email)
      .then((response) => response.toJSON())
      .catch((error) => {
        const parseError = JSON.parse(
          JSON.stringify(error) as unknown as string,
        );
        if (parseError?.code === 'auth/user-not-found') return null;

        return ErrorsFirebase.presenterError(error);
      })) as any | null;

    if (!authUser) return null;

    const authEntitie = AuthEntitie.with({
      email: authUser.email,
      userId: authUser.uid,
      accessToken: '',
      refreshToken: '',
      expirationTime: null,
      lastLoginAt: authUser.metadata.lastSignInTime,
      createdAt: null,
      updatedAt: null,
    });

    return {
      email: authEntitie.email,
      userId: authEntitie.userId,
      lastLoginAt: authEntitie.lastLoginAt,
    };
  }

  public async deleteUser({ userId }: Pick<AuthEntitieDTO, 'userId'>) {
    if (!userId)
      throw new ApiError(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS, 400);

    await this.auth
      .deleteUser(userId)
      .then()
      .catch((error) => ErrorsFirebase.presenterError(error));
  }

  public async verifyToken({
    accessToken,
  }: Pick<AuthEntitieDTO, 'accessToken'>) {
    const decodeToken = await this.auth
      .verifyIdToken(accessToken, true)
      .then((response) => response)
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    if (!decodeToken) return null;

    const user = AuthEntitie.with({
      email: decodeToken?.email ?? '',
      userId: decodeToken.uid,
      expirationTime: +decodeToken.exp.toString(),
      accessToken: '',
      refreshToken: '',
      lastLoginAt: 0,
      createdAt: null,
      updatedAt: null,
    });

    return {
      email: user.email,
      userId: user.userId,
      expirationTime: user.expirationTime,
    };
  }

  public async createNewToken({ userId }: Pick<AuthEntitieDTO, 'userId'>) {
    const newToken = await this.auth
      .createCustomToken(userId)
      .then((response) => response)
      .catch((error) => ErrorsFirebase.presenterError(error));

    if (!newToken) return null;

    const user = AuthEntitie.with({
      email: '',
      userId: '',
      expirationTime: 0,
      accessToken: newToken,
      refreshToken: '',
      lastLoginAt: 0,
      createdAt: null,
      updatedAt: null,
    });

    return {
      accessToken: user.accessToken,
    };
  }
}
