import { PaymentStatusGateway } from './../../../../../domain/Payment_Status/gateway/payment-status.gateway';
import { MapRoutes, Route } from '../route';
import { Middleware } from '../../middlewares/middleware';
import { GetPaymentStatusUseCase } from '@/usecases/payment_status/get-payment-status.usecase';
import { GetPaymentStatusRoute } from './get-payment-status.route';
import { GetPaymentStatusByIdUseCase } from '@/usecases/payment_status/get-payment-status-by-id.usecase';
import { GetPaymentStatusByIdRoute } from './get-payment-status-by-id.route';

export class PaymentStatusRoute implements MapRoutes {
  private constructor(
    private readonly paymentStatusGateway: PaymentStatusGateway,
    private readonly authVerifyMiddleware: Middleware,
    private readonly routes: Array<Route> = [],
  ) {
    this.joinRoutes();
  }

  public static create(
    paymentStatusGateway: PaymentStatusGateway,
    authVerifyMiddleware: Middleware,
  ) {
    return new PaymentStatusRoute(paymentStatusGateway, authVerifyMiddleware);
  }

  private factoryGetPaymentStatus() {
    const getPaymentStatusService = GetPaymentStatusUseCase.create({
      paymentStatusGateway: this.paymentStatusGateway,
    });
    const getPaymentStatusRoute = GetPaymentStatusRoute.create(
      getPaymentStatusService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(getPaymentStatusRoute);
  }

  private factoryGetPaymentStatusById() {
    const getPaymentStatusByIdService = GetPaymentStatusByIdUseCase.create({
      paymentStatusGateway: this.paymentStatusGateway,
    });
    const getPaymentStatusByIdRoute = GetPaymentStatusByIdRoute.create(
      getPaymentStatusByIdService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(getPaymentStatusByIdRoute);
  }

  private joinRoutes() {
    this.factoryGetPaymentStatus();
    this.factoryGetPaymentStatusById();
  }

  public execute() {
    return this.routes;
  }
}
