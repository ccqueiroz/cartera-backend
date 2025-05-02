import { PaymentMethodServiceGateway } from '../../../../../domain/Payment_Method/gateway/payment-method.service.gateway';
import { MapRoutes, Route } from '../route';
import { Middleware } from '../../middlewares/middleware';
import { GetPaymentMethodsUseCase } from '@/usecases/payment_method/get-payment-methods.usecase';
import { GetPaymentMethodsRoute } from './get-payment-methods.route';
import { GetPaymentMethodByIdUseCase } from '@/usecases/payment_method/get-payment-method-by-id.usecase';
import { GetPaymentMethodByIdRoute } from './get-payment-method-by-id.route';

export class PaymentMethodRoute implements MapRoutes {
  private constructor(
    private readonly paymentMethodGateway: PaymentMethodServiceGateway,
    private readonly authVerifyMiddleware: Middleware,
    private readonly routes: Array<Route> = [],
  ) {
    this.joinRoutes();
  }

  public static create(
    paymentMethodGateway: PaymentMethodServiceGateway,
    authVerifyMiddleware: Middleware,
  ) {
    return new PaymentMethodRoute(paymentMethodGateway, authVerifyMiddleware);
  }

  private factoryGetPaymentMethods() {
    const getPaymentMethodsService = GetPaymentMethodsUseCase.create({
      paymentMethodService: this.paymentMethodGateway,
    });
    const getPaymentMethodsRoute = GetPaymentMethodsRoute.create(
      getPaymentMethodsService,
      [this.authVerifyMiddleware.getHandler()],
    );
    this.routes.push(getPaymentMethodsRoute);
  }

  private factoryGetPaymentMethodById() {
    const getPaymentMethodByIdService = GetPaymentMethodByIdUseCase.create({
      paymentMethodService: this.paymentMethodGateway,
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
