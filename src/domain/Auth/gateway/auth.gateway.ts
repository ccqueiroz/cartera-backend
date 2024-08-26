import { AuthEntitieDTO, AuthRegisterDTO, AuthSignDTO } from '../dtos/auth.dto';

export interface AuthGateway {
  registerWithEmail({
    email,
    password,
    firstName,
    lastName,
  }: AuthRegisterDTO): Promise<AuthEntitieDTO & { id?: string }>;
  loginWithEmail({ email, password }: AuthSignDTO): Promise<AuthEntitieDTO>;
  recoveryPassword({ email }: Pick<AuthEntitieDTO, 'email'>): Promise<void>;
  signout(): Promise<void>;
  getUserByEmail({
    email,
  }: Pick<AuthEntitieDTO, 'email'>): Promise<Pick<
    AuthEntitieDTO,
    'email' | 'userId' | 'lastLoginAt'
  > | null>;
  deleteUser({ userId }: Pick<AuthEntitieDTO, 'userId'>): Promise<void>;
}
