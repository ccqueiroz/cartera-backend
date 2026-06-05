import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { AuthController } from '@/features/auth/infra/http/auth.controller';
import { RegisterAccountRoute } from '@/features/auth/infra/http/register-account.route';
import { LoginRoute } from '@/features/auth/infra/http/login.route';
import { RefreshSessionRoute } from '@/features/auth/infra/http/refresh-session.route';
import { SignoutRoute } from '@/features/auth/infra/http/signout.route';
import { RecoverPasswordRoute } from '@/features/auth/infra/http/recover-password.route';

export function authRoutes(
  controller: AuthController,
  authMiddleware: Middleware,
): Route[] {
  return [
    RegisterAccountRoute.create(controller),
    LoginRoute.create(controller),
    RefreshSessionRoute.create(controller),
    // Única rota protegida do slice: signout precisa do userId do token verificado.
    SignoutRoute.create(controller, [authMiddleware]),
    RecoverPasswordRoute.create(controller),
  ];
}
