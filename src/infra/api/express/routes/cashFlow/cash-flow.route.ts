import { BillGateway } from '@/domain/Bill/gateway/bill.gateway';
import { MapRoutes, Route } from '../route';
import { Middleware } from '../../middlewares/middleware';
import { ReceivableGateway } from '@/domain/Receivable/gateway/receivable.gateway';
import { GetConsolidatedCashFlowByYearUseCase } from '@/usecases/cash_flow/get-consolidated-cash-flow-by-year.usecase';
import { GetConsolidatedCashFlowByYearRoute } from './get-consolidated-cash-flow-by-year.route';

export class CashFlowRoute implements MapRoutes {
  private constructor(
    private readonly billGateway: BillGateway,
    private readonly receivableGateway: ReceivableGateway,
    private readonly authVerifyMiddleware: Middleware,
    private readonly routes: Array<Route> = [],
  ) {
    this.joinRoutes();
  }

  public static create(
    billGateway: BillGateway,
    receivableGateway: ReceivableGateway,
    authVerifyMiddleware: Middleware,
  ) {
    return new CashFlowRoute(
      billGateway,
      receivableGateway,
      authVerifyMiddleware,
    );
  }

  private factoryGetConsolidatedCashFlowByYear() {
    const getetConsolidatedCashFlowByYearService =
      GetConsolidatedCashFlowByYearUseCase.create({
        billGateway: this.billGateway,
        receivableGateway: this.receivableGateway,
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
