import admin from 'firebase-admin';
import firebase from 'firebase';
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

export class AuthRepositoryFirebase implements AuthGateway {
  private adminAuth: admin.auth.Auth;

  private constructor(
    private readonly auth: firebase.auth.Auth,
    private readonly adminFirebase: admin.app.App,
  ) {
    this.adminAuth = this.adminFirebase.auth();
  }

  public static create(auth: firebase.auth.Auth, adminFirebase: admin.app.App) {
    return new AuthRepositoryFirebase(auth, adminFirebase);
  }

  public async registerWithEmail({
    email,
    password,
    firstName,
    lastName,
  }: AuthRegisterDTO): Promise<AuthEntitieDTO> {
    const auth = await this.auth
      .createUserWithEmailAndPassword(email, password)
      .then((response) => response)
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    if (!auth?.user) throw new ApiError(ERROR_MESSAGES.USER_NOT_FOUND, 404);

    const data = JSON.parse(JSON.stringify(auth.user) as unknown as string);

    const authEntitie = AuthEntitie.with({
      email: data.email,
      userId: data.uid,
      accessToken: data?.stsTokenManager.accessToken,
      refreshToken: data?.stsTokenManager.refreshToken,
      expirationTime: data?.stsTokenManager.expirationTime,
      lastLoginAt: data.lastLoginAt,
      createdAt: data.createdAt,
      firstName,
      lastName,
    });

    return {
      email: authEntitie.email,
      userId: authEntitie.userId,
      accessToken: authEntitie.accessToken,
      refreshToken: authEntitie.refreshToken,
      expirationTime: authEntitie.expirationTime,
      firstName: authEntitie.firstName,
      lastName: authEntitie.lastName,
      createdAt: authEntitie.createdAt,
      lastLoginAt: authEntitie.lastLoginAt,
    };
  }

  public async loginWithEmail({
    email,
    password,
  }: AuthSignDTO): Promise<AuthEntitieDTO> {
    const auth = await this.auth
      .signInWithEmailAndPassword(email, password)
      .then((response) => response)
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    if (!auth?.user) throw new ApiError(ERROR_MESSAGES.USER_NOT_FOUND, 404);

    const data = JSON.parse(JSON.stringify(auth.user) as unknown as string);

    const authEntitie = AuthEntitie.with({
      email: data.email,
      userId: data.uid,
      accessToken: data?.stsTokenManager.accessToken,
      refreshToken: data?.stsTokenManager.refreshToken,
      expirationTime: data?.stsTokenManager.expirationTime,
      lastLoginAt: data.lastLoginAt,
    });

    return {
      email: authEntitie.email,
      userId: authEntitie.userId,
      accessToken: authEntitie.accessToken,
      refreshToken: authEntitie.refreshToken,
      expirationTime: authEntitie.expirationTime,
      lastLoginAt: authEntitie.lastLoginAt,
    };
  }

  public async recoveryPassword({
    email,
  }: Pick<AuthEntitieDTO, 'email'>): Promise<void> {
    await this.auth
      .sendPasswordResetEmail(email)
      .then((response) => response)
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });
  }

  public async signout({
    userId,
  }: Pick<AuthEntitieDTO, 'userId'>): Promise<void> {
    await this.adminAuth.revokeRefreshTokens(userId).catch((error) => {
      ErrorsFirebase.presenterError(error);
    });
  }

  public async getUserByEmail({
    email,
  }: Pick<AuthEntitieDTO, 'email'>): Promise<Pick<
    AuthEntitieDTO,
    'email' | 'userId' | 'lastLoginAt'
  > | null> {
    const authUser = (await this.adminAuth
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
      expirationTime: '',
      lastLoginAt: authUser.metadata.lastSignInTime,
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

    await this.adminAuth
      .deleteUser(userId)
      .then()
      .catch((error) => ErrorsFirebase.presenterError(error));
  }

  public async verifyToken({
    accessToken,
  }: Pick<AuthEntitieDTO, 'accessToken'>) {
    const decodeToken = await this.adminAuth
      .verifyIdToken(accessToken, true)
      .then((response) => response)
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });

    if (!decodeToken) return null;

    const user = AuthEntitie.with({
      email: decodeToken?.email ?? '',
      userId: decodeToken.uid,
      expirationTime: decodeToken.exp.toString(),
      accessToken: '',
      refreshToken: '',
      lastLoginAt: '',
    });

    return {
      email: user.email,
      userId: user.userId,
      expirationTime: user.expirationTime,
    };
  }

  public async createNewToken({ userId }: Pick<AuthEntitieDTO, 'userId'>) {
    const newToken = await this.adminAuth
      .createCustomToken(userId)
      .then((response) => response)
      .catch((error) => ErrorsFirebase.presenterError(error));

    if (!newToken) return null;

    const user = AuthEntitie.with({
      email: '',
      userId: '',
      expirationTime: '',
      accessToken: newToken,
      refreshToken: '',
      lastLoginAt: '',
    });

    return {
      accessToken: user.accessToken,
    };
  }
}
