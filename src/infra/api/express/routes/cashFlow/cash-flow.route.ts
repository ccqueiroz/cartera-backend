import { MapRoutes, Route } from '../route';
import { Middleware } from '../../middlewares/middleware';
import { GetConsolidatedCashFlowByYearUseCase } from '@/usecases/cash_flow/get-consolidated-cash-flow-by-year.usecase';
import { GetConsolidatedCashFlowByYearRoute } from './get-consolidated-cash-flow-by-year.route';
import { BillServiceGateway } from '@/domain/Bill/gateway/bill.service.gateway';
import { ReceivableServiceGateway } from '@/domain/Receivable/gateway/receivable.service.gateway';
import { GetMonthlySummaryCashFlowRoute } from './get-monthly-summary-cash-flow.route';
import { GetMonthlySummaryCashFlowUseCase } from '@/usecases/cash_flow/get-monthly-summary-cash-flow.usecase';

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
    const getConsolidatedCashFlowByYearRoute =
      GetConsolidatedCashFlowByYearRoute.create(
        getetConsolidatedCashFlowByYearService,
        [this.authVerifyMiddleware.getHandler()],
      );
    this.routes.push(getConsolidatedCashFlowByYearRoute);
  }

  private factoryGetMonthlySummaryCashFlow() {
    const getMonthlySummaryCashFlowService =
      GetMonthlySummaryCashFlowUseCase.create({
        billService: this.billServiceGateway,
        receivableService: this.receivableServiceGateway,
      });
    const getMonthlySummaryCashFlowRoute =
      GetMonthlySummaryCashFlowRoute.create(getMonthlySummaryCashFlowService, [
        this.authVerifyMiddleware.getHandler(),
      ]);
    this.routes.push(getMonthlySummaryCashFlowRoute);
  }

  private joinRoutes() {
    this.factoryGetConsolidatedCashFlowByYear();
    this.factoryGetMonthlySummaryCashFlow();
  }

  public execute() {
    return this.routes;
  }
}
