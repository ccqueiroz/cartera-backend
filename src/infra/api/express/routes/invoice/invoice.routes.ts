import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';
import { MapRoutes, Route } from '../route';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';
import { Middleware } from '../../middlewares/middleware';
import { GetInvoicesByCategoriesAndByPeriodRoute } from './get-invoices-by-categories-and-by-period.route';
import { GetInvoicesByCategoriesAndByPeriodUseCase } from '@/usecases/invoices/get-invoices-by-categories-and-by-period.usecase';

export class InvoiceRoute implements MapRoutes {
  private constructor(
    private readonly billServiceGateway: BillServiceGateway,
    private readonly receivableServiceGateway: ReceivableServiceGateway,
    private readonly authVerifyMiddleware: Middleware,
    private readonly routes: Array<Route> = [],
  ) {
    this.joinRoutes();
  }

  public static create(
    billServiceGateway: BillServiceGateway,
    receivableServiceGateway: ReceivableServiceGateway,
    authVerifyMiddleware: Middleware,
  ) {
    return new InvoiceRoute(
      billServiceGateway,
      receivableServiceGateway,
      authVerifyMiddleware,
    );
  }

  private factoryGetInvoicesByCategoriesAndByPeriod() {
    const getInvoicesByCategoriesAndByPeriodService =
      GetInvoicesByCategoriesAndByPeriodUseCase.create({
        billService: this.billServiceGateway,
        receivableService: this.receivableServiceGateway,
      });
    const getInvoicesByCategoriesAndByPeriodRoute =
      GetInvoicesByCategoriesAndByPeriodRoute.create(
        getInvoicesByCategoriesAndByPeriodService,
        [this.authVerifyMiddleware.getHandler()],
      );
    this.routes.push(getInvoicesByCategoriesAndByPeriodRoute);
  }

  private joinRoutes() {
    this.factoryGetInvoicesByCategoriesAndByPeriod();
  }

  public execute() {
    return this.routes;
  }
}
