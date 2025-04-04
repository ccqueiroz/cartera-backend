import 'dotenv/config';
import { IpControllMiddleware } from './src/infra/api/express/middlewares/ip-controll.middleware';
import { CorsMiddleware } from './src/infra/api/express/middlewares/cors.middleware';
import { BillRoute } from './src/infra/api/express/routes/bill/bill.route.routes';
import { BillsRepositoryFirebase } from './src/infra/repositories/bill.repository.firebase';
import { ValidateCategoryPaymentMethodStatusUseCase } from './src/usecases/validate_entities/validate-category-payment-method-status.usecase';
import { ReceivableRoute } from './src/infra/api/express/routes/receivable/receivables.routes';
import { ReceivablesRepositoryFirebase } from './src/infra/repositories/receivables.repository.firebase';
import { PaymentStatusRoute } from './src/infra/api/express/routes/paymentStatus/payment-status.routes';
import { PaymentStatusRepositoryFirebase } from './src/infra/repositories/payment-status.repository.firebase';
import { CategoryRoute } from './src/infra/api/express/routes/category/category.routes';
import { CategoryRepositoryFirebase } from './src/infra/repositories/category.repository.firebase';
import { PaymentMethodRepositoryFirebase } from './src/infra/repositories/payment-method.repository.firebase';
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
import { PersonUserRepositoryFirebase } from './src/infra/repositories/person-user.repository.firebase';
import { AuthRoutes } from './src/infra/api/express/routes/auth/auth.routes';
import { AuthRepositoryFirebase } from './src/infra/repositories/auth.repository.firebase';
import {
  authFirebase,
  dbFirestore,
} from './src/infra/database/firebase/firebase.database';

function main() {
  // ----- REPOSITORIES -----
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
  //

  // ----- GLOBAL MIDDLEWARES ----
  const cors = new CorsMiddleware();
  const ipControll = new IpControllMiddleware(normalizeIp);

  //  ----- ERROR MIDDLEWARE -----
  const errorMiddleware = new ErrorMiddleware();

  const api = ApiExpress.create(
    [
      ...authRoutes,
      ...personUserRoutes,
      ...paymentMethodRoutes,
      ...categoryRoutes,
      ...paymentStatusRoutes,
      ...receivableRoutes,
      ...billRoutes,
    ],
    [cors, ipControll],
    errorMiddleware,
  );
  const port = Number(process.env.PORT) || 8000;
  api.start(port);
}

main();
