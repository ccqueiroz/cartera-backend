import { PersonUserRoutes } from './src/infra/api/express/routes/personUser/person-user.routes';
import { checkIfIsNecessaryCreateNewTokenHelpers } from './src/infra/helpers';
import { VerifyTokenMiddleware } from './src/infra/api/express/middlewares/verify-token.middleware';
import { ErrorMiddleware } from './src/infra/api/express/middlewares/error.middleware';
import { ApiExpress } from './src/infra/api/express/api.express';
import { PersonUserRepositoryFirebase } from './src/infra/repositories/person-user.repository.firebase';
import { AuthRoutes } from './src/infra/api/express/routes/auth/auth.routes';
import { AuthRepositoryFirebase } from './src/infra/repositories/auth.repository.firebase';
import {
  authFirebase,
  dbFirestore,
  adminFirebase,
} from './src/infra/database/firebase/firebase.database';

function main() {
  // ----- REPOSITORIES -----
  const authRepository = AuthRepositoryFirebase.create(
    authFirebase,
    adminFirebase,
  );

  const personUserRepository = PersonUserRepositoryFirebase.create(dbFirestore);
  //

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
  //

  //  ----- ERROR MIDDLEWARE -----
  const errorMiddleware = new ErrorMiddleware();

  const api = ApiExpress.create(
    [...authRoutes, ...personUserRoutes],
    errorMiddleware,
  );
  const port = 8889;
  api.start(port);
}

main();
