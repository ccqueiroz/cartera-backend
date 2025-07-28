import 'dotenv/config';
import { PingRoutes } from './src/infra/api/express/routes/ping/ping.routes';
import { PersonUserService } from './src/services/person_user/person-user.service';
import { ReceivableService } from './src/services/receivable/receivables.service';
import { BillService } from './src/services/bill/bill.service';
import { PaymentStatusService } from './src/services/payment_status/payment-status.service';
import { PaymentMethodService } from './src/services/payment_method/payment-method.service';
import { CategoryService } from './src/services/category/category.service';
import { RedisCacheRepository } from './src/infra/repositories/reddis/cache.repository.redis';
import { clientRedis } from './src/packages/clients/redis';
import { CashFlowRoute } from './src/infra/api/express/routes/cashFlow/cash-flow.route';
import { IpControllMiddleware } from './src/infra/api/express/middlewares/ip-controll.middleware';
import { CorsMiddleware } from './src/infra/api/express/middlewares/cors.middleware';
import { BillRoute } from './src/infra/api/express/routes/bill/bill.routes';
import { BillsRepositoryFirebase } from './src/infra/repositories/firebase/bill.repository.firebase';
import { ValidateCategoryPaymentMethodUseCase } from './src/usecases/validate_entities/validate-category-payment-method.usecase';
import { ReceivableRoute } from './src/infra/api/express/routes/receivable/receivables.routes';
import { ReceivablesRepositoryFirebase } from './src/infra/repositories/firebase/receivables.repository.firebase';
import { PaymentStatusRoute } from './src/infra/api/express/routes/paymentStatus/payment-status.routes';
import { PaymentStatusRepositoryFirebase } from './src/infra/repositories/firebase/payment-status.repository.firebase';
import { CategoryRoute } from './src/infra/api/express/routes/category/category.routes';
import { CategoryRepositoryFirebase } from './src/infra/repositories/firebase/category.repository.firebase';
import { PaymentMethodRepositoryFirebase } from './src/infra/repositories/firebase/payment-method.repository.firebase';
import { PaymentMethodRoute } from './src/infra/api/express/routes/paymentMethod/payment-method.routes';
import { PersonUserRoutes } from './src/infra/api/express/routes/personUser/person-user.routes';
import {
  applyPaginationHelpers,
  applySearchByDateHelpers,
  applySortStatusHelpers,
  checkIfIsNecessaryCreateNewTokenHelpers,
  generateHashHelper,
  handleCanProgressToWritteOperation,
  mergeSortHelpers,
  normalizeIp,
} from './src/infra/helpers';
import { VerifyTokenMiddleware } from './src/infra/api/express/middlewares/verify-token.middleware';
import { ErrorMiddleware } from './src/infra/api/express/middlewares/error.middleware';
import { ApiExpress } from './src/infra/api/express/api.express';
import { PersonUserRepositoryFirebase } from './src/infra/repositories/firebase/person-user.repository.firebase';
import { AuthRoutes } from './src/infra/api/express/routes/auth/auth.routes';
import { AuthRepositoryFirebase } from './src/infra/repositories/firebase/auth.repository.firebase';
import {
  authFirebase,
  dbFirestore,
} from './src/infra/database/firebase/firebase.database';
import { logger } from './src/infra/logger';
import { InvoiceRoute } from '@/infra/api/express/routes/invoice/invoice.routes';
import { CookiesMiddleware } from '@/infra/api/express/middlewares/cookies.middleware';

function main() {
  // ----- REPOSITORIES -----
  const redisCacheRepository = RedisCacheRepository.create(clientRedis, logger);

  const authRepository = AuthRepositoryFirebase.create(authFirebase);

  const personUserRepository = PersonUserRepositoryFirebase.create(dbFirestore);

  const paymentMethodRepository =
    PaymentMethodRepositoryFirebase.create(dbFirestore);

  const categoryRepository = CategoryRepositoryFirebase.create(dbFirestore);

  const paymentStatusRepository =
    PaymentStatusRepositoryFirebase.create(dbFirestore);

  const receivableRepository = ReceivablesRepositoryFirebase.create(
    dbFirestore,
    mergeSortHelpers,
    applyPaginationHelpers,
    handleCanProgressToWritteOperation,
    applySortStatusHelpers,
    applySearchByDateHelpers,
  );

  const billRepository = BillsRepositoryFirebase.create(
    dbFirestore,
    mergeSortHelpers,
    applyPaginationHelpers,
    handleCanProgressToWritteOperation,
    applySortStatusHelpers,
    applySearchByDateHelpers,
  );
  //

  // ----- SERVICES -----
  const personUserService = PersonUserService.create(
    personUserRepository,
    redisCacheRepository,
  );

  const categoryService = CategoryService.create(
    categoryRepository,
    redisCacheRepository,
  );

  const paymentMethodService = PaymentMethodService.create(
    paymentMethodRepository,
    redisCacheRepository,
  );

  const paymentStatusService = PaymentStatusService.create(
    paymentStatusRepository,
    redisCacheRepository,
  );

  const billService = BillService.create(
    billRepository,
    redisCacheRepository,
    generateHashHelper,
  );

  const receivableService = ReceivableService.create(
    receivableRepository,
    redisCacheRepository,
    generateHashHelper,
  );

  // ------- VALIDATION - CASES -----------
  const validateCategoryPaymentMethodUseCase =
    ValidateCategoryPaymentMethodUseCase.create({
      categoryService: categoryService,
      paymentMethodService: paymentMethodService,
    });

  //MIDDLEWARES
  const authVerifyTokenMiddleware = VerifyTokenMiddleware.create(
    authRepository,
    checkIfIsNecessaryCreateNewTokenHelpers,
  );
  //

  // ----- ROUTES -----
  const pingRoutes = PingRoutes.create().execute();

  const authRoutes = AuthRoutes.create(
    authRepository,
    personUserService,
    authVerifyTokenMiddleware,
  ).execute();

  const personUserRoutes = PersonUserRoutes.create(
    personUserService,
    authVerifyTokenMiddleware,
  ).execute();

  const paymentMethodRoutes = PaymentMethodRoute.create(
    paymentMethodService,
    authVerifyTokenMiddleware,
  ).execute();

  const categoryRoutes = CategoryRoute.create(
    categoryService,
    authVerifyTokenMiddleware,
  ).execute();

  const paymentStatusRoutes = PaymentStatusRoute.create(
    paymentStatusService,
    authVerifyTokenMiddleware,
  ).execute();

  const receivableRoutes = ReceivableRoute.create(
    receivableService,
    authVerifyTokenMiddleware,
    validateCategoryPaymentMethodUseCase,
  ).execute();

  const billRoutes = BillRoute.create(
    billService,
    authVerifyTokenMiddleware,
    validateCategoryPaymentMethodUseCase,
  ).execute();

  const cashFlowRoutes = CashFlowRoute.create(
    billService,
    receivableService,
    authVerifyTokenMiddleware,
  ).execute();

  const invoicesRoutes = InvoiceRoute.create(
    billService,
    receivableService,
    authVerifyTokenMiddleware,
  ).execute();
  //

  // ----- GLOBAL MIDDLEWARES ----
  const cors = new CorsMiddleware();
  const ipControll = new IpControllMiddleware(normalizeIp);
  const cookies = new CookiesMiddleware();

  //  ----- ERROR MIDDLEWARE -----
  const errorMiddleware = new ErrorMiddleware(logger.error);

  const api = ApiExpress.create(
    [
      ...pingRoutes,
      ...authRoutes,
      ...personUserRoutes,
      ...paymentMethodRoutes,
      ...categoryRoutes,
      ...paymentStatusRoutes,
      ...receivableRoutes,
      ...billRoutes,
      ...cashFlowRoutes,
      ...invoicesRoutes,
    ],
    [cookies, cors, ipControll],
    errorMiddleware,
    logger,
    redisCacheRepository,
  );
  const port = Number(process.env.PORT) || 8000;
  api.start(port);
}

main();
