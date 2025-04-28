import { clientRedis } from './src/packages/clients/redis';
import { RedisCache } from './src/infra/database/redis/redis.database.cache';
import 'dotenv/config';
import { CashFlowRoute } from './src/infra/api/express/routes/cashFlow/cash-flow.route';
import { IpControllMiddleware } from './src/infra/api/express/middlewares/ip-controll.middleware';
import { CorsMiddleware } from './src/infra/api/express/middlewares/cors.middleware';
import { BillRoute } from './src/infra/api/express/routes/bill/bill.route.routes';
import { BillsRepositoryFirebase } from './src/infra/repositories/firebase/bill.repository.firebase';
import { ValidateCategoryPaymentMethodStatusUseCase } from './src/usecases/validate_entities/validate-category-payment-method-status.usecase';
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
  applayPaginationHelpers,
  checkIfIsNecessaryCreateNewTokenHelpers,
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

function main() {
  // ----- REPOSITORIES -----
  const redisCacheRepository = RedisCache.create(clientRedis, logger);
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
    applayPaginationHelpers,
    handleCanProgressToWritteOperation,
  );

  const billRepository = BillsRepositoryFirebase.create(
    dbFirestore,
    mergeSortHelpers,
    applayPaginationHelpers,
    handleCanProgressToWritteOperation,
  );
  //

  // ------- VALIDATION - CASES -----------
  const validateCategoryPaymentMethodStatusUseCase =
    ValidateCategoryPaymentMethodStatusUseCase.create({
      categoryGateway: categoryRepository,
      paymentMethodGateway: paymentMethodRepository,
      paymentStatusGateway: paymentStatusRepository,
    });

  //MIDDLEWARES
  const authVerifyTokenMiddleware = VerifyTokenMiddleware.create(
    authRepository,
    checkIfIsNecessaryCreateNewTokenHelpers,
  );
  //

  // ----- ROUTES -----
  const authRoutes = AuthRoutes.create(
    authRepository,
    personUserRepository,
    authVerifyTokenMiddleware,
  ).execute();

  const personUserRoutes = PersonUserRoutes.create(
    personUserRepository,
    authVerifyTokenMiddleware,
  ).execute();

  const paymentMethodRoutes = PaymentMethodRoute.create(
    paymentMethodRepository,
    authVerifyTokenMiddleware,
  ).execute();

  const categoryRoutes = CategoryRoute.create(
    categoryRepository,
    authVerifyTokenMiddleware,
  ).execute();

  const paymentStatusRoutes = PaymentStatusRoute.create(
    paymentStatusRepository,
    authVerifyTokenMiddleware,
  ).execute();

  const receivableRoutes = ReceivableRoute.create(
    receivableRepository,
    authVerifyTokenMiddleware,
    validateCategoryPaymentMethodStatusUseCase,
  ).execute();

  const billRoutes = BillRoute.create(
    billRepository,
    authVerifyTokenMiddleware,
    validateCategoryPaymentMethodStatusUseCase,
  ).execute();

  const cashFlowRoutes = CashFlowRoute.create(
    billRepository,
    receivableRepository,
    authVerifyTokenMiddleware,
  ).execute();
  //

  // ----- GLOBAL MIDDLEWARES ----
  const cors = new CorsMiddleware();
  const ipControll = new IpControllMiddleware(normalizeIp);

  //  ----- ERROR MIDDLEWARE -----
  const errorMiddleware = new ErrorMiddleware(logger.error);

  const api = ApiExpress.create(
    [
      ...authRoutes,
      ...personUserRoutes,
      ...paymentMethodRoutes,
      ...categoryRoutes,
      ...paymentStatusRoutes,
      ...receivableRoutes,
      ...billRoutes,
      ...cashFlowRoutes,
    ],
    [cors, ipControll],
    errorMiddleware,
    logger,
    redisCacheRepository,
  );
  const port = Number(process.env.PORT) || 8000;
  api.start(port);
}

main();
