import { MapRoutes, Route } from '../route';
import { Middleware } from '../../middlewares/middleware';
import { ValidateCategoryPaymentMethodUseCase } from '@/usecases/validate_entities/validate-category-payment-method.usecase';
import { GetBillsUseCase } from '@/usecases/bill/get-bills.usecase';
import { GetBillsRoute } from './get-bills.route';
import { GetBillByIdUseCase } from '@/usecases/bill/get-bill-by-id.usecase';
import { GetBillByIdRoute } from './get-bill-by-id.route';
import { CreateBillUseCase } from '@/usecases/bill/create-bill.usecase';
import { CreateBillRoute } from './create-bill.route';
import { EditBillUseCase } from '@/usecases/bill/edit-bill.usecase';
import { EditBillRoute } from './edit-bill.route';
import { DeleteBillUseCase } from '@/usecases/bill/delete-bill.usecase';
import { DeleteBillRoute } from './delete-bill.route';
import { GetBillsPayableMonthUseCase } from '@/usecases/bill/get-bills-payable-month.usecase';
import { GetBillsPayableMonthRoute } from './get-bills-payable-month.route';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';
import { EditBillByPayableMonthUseCase } from '@/usecases/bill/edit-bill-by-payable-month.usecase';
import { EditBillByPayableMonthRoute } from './edit-bill-by-payable-month.route';

export class BillRoute implements MapRoutes {
  private constructor(
    private readonly billServiceGateway: BillServiceGateway,
    private readonly authVerifyMiddleware: Middleware,
    private readonly validateCategoryPaymentMethodUseCase: ValidateCategoryPaymentMethodUseCase,
    private readonly routes: Array<Route> = [],
  ) {
    this.joinRoutes();
  }

  public static create(
    billServiceGateway: BillServiceGateway,
    authVerifyMiddleware: Middleware,
    validateCategoryPaymentMethodUseCase: ValidateCategoryPaymentMethodUseCase,
  ) {
    return new BillRoute(
      billServiceGateway,
      authVerifyMiddleware,
      validateCategoryPaymentMethodUseCase,
    );
  }

  private factoryGetBills() {
    const getBillsService = GetBillsUseCase.create({
      billService: this.billServiceGateway,
    });
    const getBillsRoute = GetBillsRoute.create(getBillsService, [
      this.authVerifyMiddleware.getHandler(),
    ]);
    this.routes.push(getBillsRoute);
  }

  private factoryGetBillById() {
    const getBillByIdService = GetBillByIdUseCase.create({
      billService: this.billServiceGateway,
    });
    const getBillByIdRoute = GetBillByIdRoute.create(getBillByIdService, [
      this.authVerifyMiddleware.getHandler(),
    ]);
    this.routes.push(getBillByIdRoute);
  }

  private factoryCreateBill() {
    const createBillService = CreateBillUseCase.create({
      billService: this.billServiceGateway,
      validateCategoryPaymentMethodService:
        this.validateCategoryPaymentMethodUseCase,
    });
    const createBillRoute = CreateBillRoute.create(createBillService, [
      this.authVerifyMiddleware.getHandler(),
    ]);
    this.routes.push(createBillRoute);
  }

  private factoryUpdateBill() {
    const updateBillService = EditBillUseCase.create({
      billService: this.billServiceGateway,
      validateCategoryPaymentMethodService:
        this.validateCategoryPaymentMethodUseCase,
    });
    const updateBillRoute = EditBillRoute.create(updateBillService, [
      this.authVerifyMiddleware.getHandler(),
    ]);
    this.routes.push(updateBillRoute);
  }

  private factoryDeleteBill() {
    const deleteBillService = DeleteBillUseCase.create({
      billService: this.billServiceGateway,
    });
    const deleteBillRoute = DeleteBillRoute.create(deleteBillService, [
      this.authVerifyMiddleware.getHandler(),
    ]);
    this.routes.push(deleteBillRoute);
  }

  private factoryGetBillsPayableMonth() {
    const getBillsPayableMonthService = GetBillsPayableMonthUseCase.create({
      billService: this.billServiceGateway,
    });
    const getBillsPayableMonthServiceRoute = GetBillsPayableMonthRoute.create(
      getBillsPayableMonthService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(getBillsPayableMonthServiceRoute);
  }

  private factoryUpdateBillByPayableMonth() {
    const updateBillByPayableMonthService =
      EditBillByPayableMonthUseCase.create({
        billService: this.billServiceGateway,
        validateCategoryPaymentMethodService:
          this.validateCategoryPaymentMethodUseCase,
      });
    const updateBillByPayableMonthRoute = EditBillByPayableMonthRoute.create(
      updateBillByPayableMonthService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(updateBillByPayableMonthRoute);
  }

  private joinRoutes() {
    this.factoryGetBills();
    this.factoryGetBillById();
    this.factoryCreateBill();
    this.factoryUpdateBill();
    this.factoryDeleteBill();
    this.factoryGetBillsPayableMonth();
    this.factoryUpdateBillByPayableMonth();
  }

  public execute() {
    return this.routes;
  }
}
