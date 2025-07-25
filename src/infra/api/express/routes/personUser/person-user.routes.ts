import { MapRoutes, Route } from '../route';
import { Middleware } from '../../middlewares/middleware';
import { EditPersonUserUseCase } from '@/usecases/person_user/edit-person-user.usecase';
import { EditPersonUserRoute } from './edit-person-user.route';
import { PersonUserServiceGateway } from '@/domain/Person_User/gateway/person-user.service.gateway';
import { GetPersonUserByUserIdlUseCase } from '@/usecases/person_user/get-person-user-by-user-id.usecase';
import { GetPersonUserByUserIdRoute } from './get-person-user-by-user-id.route';

export class PersonUserRoutes implements MapRoutes {
  private constructor(
    private readonly personUserServiceGateway: PersonUserServiceGateway,
    private readonly authVerifyMiddleware: Middleware,
    private readonly routes: Array<Route> = [],
  ) {
    this.joinRoutes();
  }

  public static create(
    personUserServiceGateway: PersonUserServiceGateway,
    authVerifyMiddleware: Middleware,
  ) {
    return new PersonUserRoutes(personUserServiceGateway, authVerifyMiddleware);
  }

  private factoryEditPersonUser() {
    const editPersonUserService = EditPersonUserUseCase.create({
      personUserService: this.personUserServiceGateway,
    });
    const editPersonUserRoute = EditPersonUserRoute.create(
      editPersonUserService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(editPersonUserRoute);
  }

  private factoryGetPersonUserByUserId() {
    const getPersonUserByUserIdService = GetPersonUserByUserIdlUseCase.create({
      personUserService: this.personUserServiceGateway,
    });
    const getPersonUserByUserIdRoute = GetPersonUserByUserIdRoute.create(
      getPersonUserByUserIdService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(getPersonUserByUserIdRoute);
  }

  private joinRoutes() {
    this.factoryEditPersonUser();
    this.factoryGetPersonUserByUserId();
  }

  public execute() {
    return this.routes;
  }
}
