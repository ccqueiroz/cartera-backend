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

  // ----- ROUTES -----
  const authRoutes = AuthRoutes.create(
    authRepository,
    personUserRepository,
  ).execute();
  //

  //  ----- ERROR MIDDLEWARE -----
  const errorMiddleware = new ErrorMiddleware();

  const api = ApiExpress.create([...authRoutes], errorMiddleware);
  const port = 8889;
  api.start(port);
}

main();
