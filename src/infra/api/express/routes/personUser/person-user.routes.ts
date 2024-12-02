import { PersonUserGateway } from '@/domain/Person_User/gateway/person_user.gateway';
import { MapRoutes, Route } from '../route';
import { Middleware } from '../../middlewares/middleware';
import { EditPersonUserUseCase } from '@/usecases/person_user/edit-person-user.usecase';
import { EditPersonUserRoute } from './edit-person-user.route';

export class PersonUserRoutes implements MapRoutes {
  private constructor(
    private readonly personUserGateway: PersonUserGateway,
    private readonly authVerifyMiddleware: Middleware,
    private readonly routes: Array<Route> = [],
  ) {
    this.joinRoutes();
  }

  public static create(
    personUserGateway: PersonUserGateway,
    authVerifyMiddleware: Middleware,
  ) {
    return new PersonUserRoutes(personUserGateway, authVerifyMiddleware);
  }

  private factoryEditPersonUser() {
    const editPersonUserService = EditPersonUserUseCase.create({
      personUserGateway: this.personUserGateway,
    });
    const editPersonUserRoute = EditPersonUserRoute.create(
      editPersonUserService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(editPersonUserRoute);
  }

  private joinRoutes() {
    this.factoryEditPersonUser();
  }

  public execute() {
    return this.routes;
  }
}
