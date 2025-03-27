import { BillGateway } from '@/domain/Bill/gateway/bill.gateway';
import { MapRoutes, Route } from '../route';
import { Middleware } from '../../middlewares/middleware';
import { ValidateCategoryPaymentMethodStatusUseCase } from '@/usecases/validate_entities/validate-category-payment-method-status.usecase';
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

export class BillRoute implements MapRoutes {
  private constructor(
    private readonly billGateway: BillGateway,
    private readonly authVerifyMiddleware: Middleware,
    private readonly validateCategoryPaymentMethodStatusUseCase: ValidateCategoryPaymentMethodStatusUseCase,
    private readonly routes: Array<Route> = [],
  ) {
    this.joinRoutes();
  }

  public static create(
    billGateway: BillGateway,
    authVerifyMiddleware: Middleware,
    validateCategoryPaymentMethodStatusUseCase: ValidateCategoryPaymentMethodStatusUseCase,
  ) {
    return new BillRoute(
      billGateway,
      authVerifyMiddleware,
      validateCategoryPaymentMethodStatusUseCase,
    );
  }

  private factoryGetBills() {
    const getBillsService = GetBillsUseCase.create({
      billGateway: this.billGateway,
    });
    const getBillsRoute = GetBillsRoute.create(getBillsService, [
      this.authVerifyMiddleware.getHandler(),
    ]);
    this.routes.push(getBillsRoute);
  }

  private factoryGetBillById() {
    const getBillByIdService = GetBillByIdUseCase.create({
      billGateway: this.billGateway,
    });
    const getBillByIdRoute = GetBillByIdRoute.create(getBillByIdService, [
      this.authVerifyMiddleware.getHandler(),
    ]);
    this.routes.push(getBillByIdRoute);
  }

  private factoryCreateBill() {
    const createBillService = CreateBillUseCase.create({
      billGateway: this.billGateway,
      validateCategoryPaymentMethodStatusService:
        this.validateCategoryPaymentMethodStatusUseCase,
    });
    const createBillRoute = CreateBillRoute.create(createBillService, [
      this.authVerifyMiddleware.getHandler(),
    ]);
    this.routes.push(createBillRoute);
  }

  private factoryUpdateBill() {
    const updateBillService = EditBillUseCase.create({
      billGateway: this.billGateway,
      validateCategoryPaymentMethodStatusService:
        this.validateCategoryPaymentMethodStatusUseCase,
    });
    const updateBillRoute = EditBillRoute.create(updateBillService, [
      this.authVerifyMiddleware.getHandler(),
    ]);
    this.routes.push(updateBillRoute);
  }

  private factoryDeleteBill() {
    const deleteBillService = DeleteBillUseCase.create({
      billGateway: this.billGateway,
    });
    const deleteBillRoute = DeleteBillRoute.create(deleteBillService, [
      this.authVerifyMiddleware.getHandler(),
    ]);
    this.routes.push(deleteBillRoute);
  }

  private joinRoutes() {
    this.factoryGetBills();
    this.factoryGetBillById();
    this.factoryCreateBill();
    this.factoryUpdateBill();
    this.factoryDeleteBill();
  }

  public execute() {
    return this.routes;
  }
}
