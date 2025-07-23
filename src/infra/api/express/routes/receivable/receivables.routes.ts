import { MapRoutes, Route } from './../route';
import { Middleware } from '../../middlewares/middleware';
import { GetReceivablesRoute } from './get-receivables.route';
import { GetReceivablesUseCase } from '@/usecases/receivable/get-receivables.usecase';
import { GetReceivableByIdUseCase } from '@/usecases/receivable/get-receivable-by-id.usecase';
import { GetReceivableByIdRoute } from './get-receivable-by-id.route';
import { CreateReceivableUseCase } from '@/usecases/receivable/create-receivable.usecase';
import { ValidateCategoryPaymentMethodUseCase } from '@/usecases/validate_entities/validate-category-payment-method.usecase';
import { CreateReceivableRoute } from './create-receivable.route';
import { EditReceivableUseCase } from '@/usecases/receivable/edit-receivable.usecase';
import { EditReceivableRoute } from './edit-receivable.route';
import { DeleteReceivableUseCase } from '@/usecases/receivable/delete-receivable.usecase';
import { DeleteReceivableRoute } from './delete-receivable.route';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';
import { GetReceivablesByMonthUseCase } from '@/usecases/receivable/get-receivables-by-month.usecase';
import { GetReceivablesByMonthRoute } from './get-receivabes-by-month.route';

export class ReceivableRoute implements MapRoutes {
  private constructor(
    private readonly receivableServiceGateway: ReceivableServiceGateway,
    private readonly authVerifyMiddleware: Middleware,
    private readonly validateCategoryPaymentMethodUseCase: ValidateCategoryPaymentMethodUseCase,
    private readonly routes: Array<Route> = [],
  ) {
    this.joinRoutes();
  }

  public static create(
    receivableServiceGateway: ReceivableServiceGateway,
    authVerifyMiddleware: Middleware,
    validateCategoryPaymentMethodUseCase: ValidateCategoryPaymentMethodUseCase,
  ) {
    return new ReceivableRoute(
      receivableServiceGateway,
      authVerifyMiddleware,
      validateCategoryPaymentMethodUseCase,
    );
  }

  private factoryGetReceivables() {
    const getReceivablesService = GetReceivablesUseCase.create({
      receivableService: this.receivableServiceGateway,
    });
    const getReceivablesRoute = GetReceivablesRoute.create(
      getReceivablesService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(getReceivablesRoute);
  }

  private factoryGetReceivableById() {
    const getReceivableByIdService = GetReceivableByIdUseCase.create({
      receivableService: this.receivableServiceGateway,
    });
    const getReceivableByIdRoute = GetReceivableByIdRoute.create(
      getReceivableByIdService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(getReceivableByIdRoute);
  }

  private factoryCreateReceivable() {
    const createReceivableService = CreateReceivableUseCase.create({
      receivableService: this.receivableServiceGateway,
      validateCategoryPaymentMethodService:
        this.validateCategoryPaymentMethodUseCase,
    });
    const createReceivableRoute = CreateReceivableRoute.create(
      createReceivableService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(createReceivableRoute);
  }

  private factoryUpdateReceivable() {
    const updateReceivableService = EditReceivableUseCase.create({
      receivableService: this.receivableServiceGateway,
      validateCategoryPaymentMethodService:
        this.validateCategoryPaymentMethodUseCase,
    });
    const updateReceivableRoute = EditReceivableRoute.create(
      updateReceivableService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(updateReceivableRoute);
  }

  private factoryDeleteReceivable() {
    const deleteReceivableService = DeleteReceivableUseCase.create({
      receivableService: this.receivableServiceGateway,
    });
    const deleteReceivableRoute = DeleteReceivableRoute.create(
      deleteReceivableService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(deleteReceivableRoute);
  }

  private factoryReceivableByMonth() {
    const receivableByMonthService = GetReceivablesByMonthUseCase.create({
      receivableService: this.receivableServiceGateway,
    });
    const receivableByMonthRoute = GetReceivablesByMonthRoute.create(
      receivableByMonthService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(receivableByMonthRoute);
  }

  private joinRoutes() {
    this.factoryGetReceivables();
    this.factoryGetReceivableById();
    this.factoryCreateReceivable();
    this.factoryUpdateReceivable();
    this.factoryDeleteReceivable();
    this.factoryReceivableByMonth();
  }

  public execute() {
    return this.routes;
  }
}
