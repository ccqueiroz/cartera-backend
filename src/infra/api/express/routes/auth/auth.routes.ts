import { AuthGateway } from '@/domain/Auth/gateway/auth.gateway';
import { MapRoutes, Route } from '../route';
import { SignoutRoute } from './signout.route';
import { SignoutUseCase } from '@/usecases/auth/signout.usecase';
import { LoginRoute } from './login.route';
import { LoginUseCase } from '@/usecases/auth/login.usecase';
import { RecoveryPasswordRoute } from './recovery-password.route';
import { RecoveryPasswordUseCase } from '@/usecases/auth/recovery-password.usecase';
import { RegisterRoute } from './register.route';
import { RegisterUserUseCase } from '@/usecases/auth/register.usecase';
import { emailValidator } from '@/infra/validators';
import { GetPersonUserByEmailUseCase } from '@/usecases/person_user/get-person-user-by-email.usecase';
import { CreatePersonUserUseCase } from '@/usecases/person_user/create-person-user.usecase';
import { Middleware } from '../../middlewares/middleware';
import { PersonUserServiceGateway } from '@/domain/Person_User/gateway/person-user.service.gateway';

export class AuthRoutes implements MapRoutes {
  private getPersonUserByEmail: GetPersonUserByEmailUseCase;
  private createPersonUser: CreatePersonUserUseCase;

  private constructor(
    private readonly authGateway: AuthGateway,
    private readonly personUserServiceGateway: PersonUserServiceGateway,
    private readonly authVerifyMiddleware: Middleware,
    private readonly routes: Array<Route> = [],
  ) {
    this.getPersonUserByEmail = GetPersonUserByEmailUseCase.create({
      emailValidatorGateway: emailValidator,
      personUserService: this.personUserServiceGateway,
    });
    this.createPersonUser = CreatePersonUserUseCase.create({
      emailValidatorGateway: emailValidator,
      personUserService: this.personUserServiceGateway,
    });

    this.joinRoutes();
  }

  public static create(
    authGateway: AuthGateway,
    personUserServiceGateway: PersonUserServiceGateway,
    authVerifyMiddleware: Middleware,
  ) {
    return new AuthRoutes(
      authGateway,
      personUserServiceGateway,
      authVerifyMiddleware,
    );
  }

  private factorySignout() {
    const signoutService = SignoutUseCase.create(this.authGateway);
    const signoutRoute = SignoutRoute.create(signoutService, [
      this.authVerifyMiddleware.getHandler(),
    ]);
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
      this.getPersonUserByEmail,
      emailValidator,
    );
    const recoveryPasswordRoute = RecoveryPasswordRoute.create(
      recoveryPasswordService,
    );
    this.routes.push(recoveryPasswordRoute);
  }

  private factoryRegisterAccount() {
    const registerAccountService = RegisterUserUseCase.create({
      authGateway: this.authGateway,
      emailValidatorGateway: emailValidator,
      createPersonUser: this.createPersonUser,
    });
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
