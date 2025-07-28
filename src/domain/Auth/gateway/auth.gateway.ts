import {
  AuthEntitieDTO,
  AuthRefreshTokenDTO,
  AuthRegisterDTO,
  AuthSignDTO,
} from '../dtos/auth.dto';

export interface AuthGateway {
  registerWithEmail({
    email,
    password,
    firstName,
    lastName,
  }: Omit<AuthRegisterDTO, 'updatedAt'>): Promise<
    Omit<
      AuthEntitieDTO,
      'accessToken' | 'refreshToken' | 'expirationTime' | 'lastLoginAt'
    > & {
      id?: string;
    }
  >;
  loginWithEmail({
    email,
    password,
  }: Omit<AuthSignDTO, 'updatedAt'>): Promise<
    Omit<AuthEntitieDTO, 'lastLoginAt' | 'createdAt' | 'updatedAt'>
  >;
  recoveryPassword({ email }: Pick<AuthEntitieDTO, 'email'>): Promise<void>;
  signout({ userId }: Pick<AuthEntitieDTO, 'userId'>): Promise<void>;
  getUserByEmail({
    email,
  }: Pick<AuthEntitieDTO, 'email'>): Promise<Pick<
    AuthEntitieDTO,
    'email' | 'userId' | 'lastLoginAt'
  > | null>;
  deleteUser({ userId }: Pick<AuthEntitieDTO, 'userId'>): Promise<void>;
  verifyToken({
    accessToken,
  }: Pick<AuthEntitieDTO, 'accessToken'>): Promise<Pick<
    AuthEntitieDTO,
    'userId' | 'email' | 'expirationTime'
  > | null>;
  createNewToken({
    userId,
  }: Pick<AuthEntitieDTO, 'userId'>): Promise<Pick<
    AuthEntitieDTO,
    'accessToken'
  > | null>;
  refreshToken({
    refreshToken,
  }: AuthRefreshTokenDTO): Promise<
    Omit<AuthEntitieDTO, 'email' | 'lastLoginAt' | 'createdAt' | 'updatedAt'>
  >;
}
