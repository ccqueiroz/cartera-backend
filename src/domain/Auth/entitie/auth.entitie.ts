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

  public get firstName() {
    return this.props.firstName;
  }

  public get lastName() {
    return this.props.lastName;
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

  public get createdAt() {
    return this.props.createdAt;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }
}
