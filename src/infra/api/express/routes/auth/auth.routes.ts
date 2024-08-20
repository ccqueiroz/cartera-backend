import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { MapRoutes, Route } from '../route';
import { PersonUserGateway } from '@/domain/Person_User/gateway/person_user.gateway';
import { SignoutRoute } from './signout.route';
import { SignoutUseCase } from '@/usecases/auth/signout.usecase';
import { LoginRoute } from './login.route';
import { LoginUseCase } from '@/usecases/auth/login.usecase';
import { RecoveryPasswordRoute } from './recovery-password.route';
import { RecoveryPasswordUseCase } from '@/usecases/auth/recovery-password.usecase';
import { RegisterRoute } from './register.route';
import { RegisterUserUseCase } from '@/usecases/auth/register.usecase';
import { emailValidator } from '@/infra/validators';

export class AuthRoutes implements MapRoutes {
  private constructor(
    private readonly authGateway: AuthGateway,
    private readonly personUserGateway: PersonUserGateway,
    private readonly routes: Array<Route> = [],
  ) {
    this.joinRoutes();
  }

  public static create(
    authGateway: AuthGateway,
    personUserGateway: PersonUserGateway,
  ) {
    return new AuthRoutes(authGateway, personUserGateway);
  }

  private factorySignout() {
    const signoutService = SignoutUseCase.create(this.authGateway);
    const signoutRoute = SignoutRoute.create(signoutService);
    this.routes.push(signoutRoute);
  }

  private factoryLogin() {
    const loginService = LoginUseCase.create(this.authGateway, emailValidator);
    const loginRoute = LoginRoute.create(loginService);
    this.routes.push(loginRoute);
  }

  private factoryRecoveryPassword() {
    const recoveryPasswordService = RecoveryPasswordUseCase.create(
      this.authGateway,
      this.personUserGateway,
      emailValidator,
    );
    const recoveryPasswordRoute = RecoveryPasswordRoute.create(
      recoveryPasswordService,
    );
    this.routes.push(recoveryPasswordRoute);
  }

  private factoryRegisterAccount() {
    const registerAccountService = RegisterUserUseCase.create(
      this.authGateway,
      emailValidator,
    );
    const registerAccountRoute = RegisterRoute.create(registerAccountService);
    this.routes.push(registerAccountRoute);
  }

  private joinRoutes() {
    this.factoryLogin();
    this.factorySignout();
    this.factoryRecoveryPassword();
    this.factoryRegisterAccount();
  }

  public execute() {
    return this.routes;
  }
}