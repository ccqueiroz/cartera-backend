import { AuthEntitieDTO } from '../dtos/auth.dto';

export type AuthEntitieProps = AuthEntitieDTO;

export class AuthEntitie {
  private constructor(private props: AuthEntitieProps) {}

  public static with(props: AuthEntitieProps) {
    return new AuthEntitie(props);
  }

  public get userId() {
    return this.props.userId;
  }

  public get accessToken() {
    return this.props.accessToken;
  }

  public get email() {
    return this.props.email;
  }

  public get expirationTime() {
    return this.props.expirationTime;
  }

  public get refreshToken() {
    return this.props.refreshToken;
  }

  public get lastLoginAt() {
    return this.props.lastLoginAt;
  }
}
