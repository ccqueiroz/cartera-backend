import { MapRoutes, Route } from '../route';
import { Middleware } from '../../middlewares/middleware';
import { GetConsolidatedCashFlowByYearUseCase } from '@/usecases/cash_flow/get-consolidated-cash-flow-by-year.usecase';
import { GetConsolidatedCashFlowByYearRoute } from './get-consolidated-cash-flow-by-year.route';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';

export class CashFlowRoute implements MapRoutes {
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
    return new CashFlowRoute(
      billServiceGateway,
      receivableServiceGateway,
      authVerifyMiddleware,
    );
  }

  private factoryGetConsolidatedCashFlowByYear() {
    const getetConsolidatedCashFlowByYearService =
      GetConsolidatedCashFlowByYearUseCase.create({
        billService: this.billServiceGateway,
        receivableService: this.receivableServiceGateway,
      });
    const getConsolidatedCashFlowByYearServiceRoute =
      GetConsolidatedCashFlowByYearRoute.create(
        getetConsolidatedCashFlowByYearService,
        [this.authVerifyMiddleware.getHandler()],
      );
    this.routes.push(getConsolidatedCashFlowByYearServiceRoute);
  }

  private joinRoutes() {
    this.factoryGetConsolidatedCashFlowByYear();
  }

  public execute() {
    return this.routes;
  }
}
