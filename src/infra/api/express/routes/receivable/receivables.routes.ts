import { ReceivableGateway } from '@/domain/Receivable/gateway/receivable.gateway';
import { MapRoutes, Route } from './../route';
import { Middleware } from '../../middlewares/middleware';
import { GetReceivablesRoute } from './get-receivables.route';
import { GetReceivablesUseCase } from '@/usecases/receivable/get-receivables.usecase';
import { GetReceivableByIdUseCase } from '@/usecases/receivable/get-receivable-by-id.usecase';
import { GetReceivableByIdRoute } from './get-receivable-by-id.route';
import { CreateReceivableUseCase } from '@/usecases/receivable/create-receivable.usecase';
import { ValidateCategoryPaymentMethodStatusUseCase } from '@/usecases/validate_entities/validate-category-payment-method-status.usecase';
import { CreateReceivableRoute } from './create-receivable.route';
import { EditReceivableUseCase } from '@/usecases/receivable/edit-receivable.usecase';
import { EditReceivableRoute } from './edit-receivable.route';
import { DeleteReceivableUseCase } from '@/usecases/receivable/delete-receivable.usecase';
import { DeleteReceivableRoute } from './delete-receivable.route';

export class ReceivableRoute implements MapRoutes {
  private constructor(
    private readonly receivableGateway: ReceivableGateway,
    private readonly authVerifyMiddleware: Middleware,
    private readonly validateCategoryPaymentMethodStatusUseCase: ValidateCategoryPaymentMethodStatusUseCase,
    private readonly routes: Array<Route> = [],
  ) {
    this.joinRoutes();
  }

  public static create(
    receivableGateway: ReceivableGateway,
    authVerifyMiddleware: Middleware,
    validateCategoryPaymentMethodStatusUseCase: ValidateCategoryPaymentMethodStatusUseCase,
  ) {
    return new ReceivableRoute(
      receivableGateway,
      authVerifyMiddleware,
      validateCategoryPaymentMethodStatusUseCase,
    );
  }

  private factoryGetReceivables() {
    const getReceivablesService = GetReceivablesUseCase.create({
      receivableGateway: this.receivableGateway,
    });
    const getReceivablesRoute = GetReceivablesRoute.create(
      getReceivablesService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(getReceivablesRoute);
  }

  private factoryGetReceivableById() {
    const getReceivableByIdService = GetReceivableByIdUseCase.create({
      receivableGateway: this.receivableGateway,
    });
    const getReceivableByIdRoute = GetReceivableByIdRoute.create(
      getReceivableByIdService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(getReceivableByIdRoute);
  }

  private factoryCreateReceivable() {
    const createReceivableService = CreateReceivableUseCase.create({
      receivableGateway: this.receivableGateway,
      validateCategoryPaymentMethodStatusService:
        this.validateCategoryPaymentMethodStatusUseCase,
    });
    const createReceivableRoute = CreateReceivableRoute.create(
      createReceivableService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(createReceivableRoute);
  }

  private factoryUpdateReceivable() {
    const updateReceivableService = EditReceivableUseCase.create({
      receivableGateway: this.receivableGateway,
      validateCategoryPaymentMethodStatusService:
        this.validateCategoryPaymentMethodStatusUseCase,
    });
    const updateReceivableRoute = EditReceivableRoute.create(
      updateReceivableService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(updateReceivableRoute);
  }

  private factoryDeleteReceivable() {
    const deleteReceivableService = DeleteReceivableUseCase.create({
      receivableGateway: this.receivableGateway,
    });
    const deleteReceivableRoute = DeleteReceivableRoute.create(
      deleteReceivableService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(deleteReceivableRoute);
  }

  private joinRoutes() {
    this.factoryGetReceivables();
    this.factoryGetReceivableById();
    this.factoryCreateReceivable();
    this.factoryUpdateReceivable();
    this.factoryDeleteReceivable();
  }

  public execute() {
    return this.routes;
  }
}
