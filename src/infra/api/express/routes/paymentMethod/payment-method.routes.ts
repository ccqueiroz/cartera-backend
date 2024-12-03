import { PaymentMethodGateway } from './../../../../../domain/Payment_Method/gateway/payment-method.gateway';
import { MapRoutes, Route } from '../route';
import { Middleware } from '../../middlewares/middleware';
import { GetPaymentMethodsUseCase } from '@/usecases/payment_method/get-payment-methods.usecase';
import { GetPaymentMethodsRoute } from './get-payment-methods.route';
import { GetPaymentMethodByIdUseCase } from '@/usecases/payment_method/get-payment-method-by-id.usecase';
import { GetPaymentMethodByIdRoute } from './get-payment-method-by-id.route';

export class PaymentMethodRoute implements MapRoutes {
  private constructor(
    private readonly paymentMethodGateway: PaymentMethodGateway,
    private readonly authVerifyMiddleware: Middleware,
    private readonly routes: Array<Route> = [],
  ) {
    this.joinRoutes();
  }

  public static create(
    paymentMethodGateway: PaymentMethodGateway,
    authVerifyMiddleware: Middleware,
  ) {
    return new PaymentMethodRoute(paymentMethodGateway, authVerifyMiddleware);
  }

  private factoryGetPaymentMethods() {
    const getPaymentMethodsService = GetPaymentMethodsUseCase.create({
      paymentMethodGateway: this.paymentMethodGateway,
    });
    const getPaymentMethodsRoute = GetPaymentMethodsRoute.create(
      getPaymentMethodsService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(getPaymentMethodsRoute);
  }

  private factoryGetPaymentMethodById() {
    const getPaymentMethodByIdService = GetPaymentMethodByIdUseCase.create({
      paymentMethodGateway: this.paymentMethodGateway,
    });
    const getPaymentMethodByIdRoute = GetPaymentMethodByIdRoute.create(
      getPaymentMethodByIdService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(getPaymentMethodByIdRoute);
  }

  private joinRoutes() {
    this.factoryGetPaymentMethods();
    this.factoryGetPaymentMethodById();
  }

  public execute() {
    return this.routes;
  }
}
