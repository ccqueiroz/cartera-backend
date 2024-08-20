import { AuthEntitieDTO, AuthSignDTO } from '../dtos/auth.dto';

export interface AuthGateway {
  registerWithEmail({ email, password }: AuthSignDTO): Promise<AuthEntitieDTO>;
  loginWithEmail({ email, password }: AuthSignDTO): Promise<AuthEntitieDTO>;
  recoveryPassword({ email }: Pick<AuthEntitieDTO, 'email'>): Promise<void>;
  signout(): Promise<void>;
}
