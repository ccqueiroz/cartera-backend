import firebase from 'firebase';
import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { AuthSignDTO, AuthEntitieDTO } from '@/domain/Auth/dtos/auth.dto';
import { AuthEntitie } from '@/domain/Auth/entitie/auth.entitie';
import { ApiError } from '@/helpers/errors';
import { ERROR_MESSAGES } from '@/helpers/errorMessages';
import { ErrorsFirebase } from '../database/firebase/errorHandling';

export class AuthRepositoryFirebase implements AuthGateway {
  private constructor(private readonly auth: firebase.auth.Auth) {}

  public static create(auth: firebase.auth.Auth) {
    return new AuthRepositoryFirebase(auth);
  }

  public async registerWithEmail({
    email,
    password,
  }: AuthSignDTO): Promise<AuthEntitieDTO> {
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

  public async signout(): Promise<void> {
    await this.auth
      .signOut()
      .then()
      .catch((error) => {
        ErrorsFirebase.presenterError(error);
      });
  }
}
