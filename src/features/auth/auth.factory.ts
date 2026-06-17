import { Route } from '@/shared/http/route';
import { Middleware } from '@/shared/http/middleware';
import { AuthProviderGateway } from '@/features/auth/domain/ports/auth-provider.gateway';
import { PersonGateway } from '@/features/auth/domain/ports/person.gateway';
import { WalletProvisionGateway } from '@/features/auth/domain/ports/wallet-provision.gateway';
import { LoggerGateway } from '@/shared/logger/logger.gateway';
import { RegisterAccountUseCase } from '@/features/auth/application/register-account.usecase';
import { LoginUseCase } from '@/features/auth/application/login.usecase';
import { RefreshSessionUseCase } from '@/features/auth/application/refresh-session.usecase';
import { SignoutUseCase } from '@/features/auth/application/signout.usecase';
import { RecoverPasswordUseCase } from '@/features/auth/application/recover-password.usecase';
import { AuthController } from '@/features/auth/infra/http/auth.controller';
import { authRoutes } from '@/features/auth/infra/http/auth.routes';

export interface AuthModuleDeps {
  authMiddleware: Middleware;
  authProviderGateway: AuthProviderGateway;
  // Porta, NÃO a feature person concreta — adapter montado no composition root.
  personGateway: PersonGateway;
  // Porta de provisão da wallet (seed no signup); opcional e não-bloqueante.
  walletProvisionGateway?: WalletProvisionGateway;
  logger?: LoggerGateway;
}

export function makeAuthModule(deps: AuthModuleDeps): Route[] {
  const registerAccount = RegisterAccountUseCase.create(
    deps.authProviderGateway,
    deps.personGateway,
    deps.walletProvisionGateway,
    deps.logger,
  );
  const login = LoginUseCase.create(
    deps.authProviderGateway,
    deps.personGateway,
  );
  const refreshSession = RefreshSessionUseCase.create(deps.authProviderGateway);
  const signout = SignoutUseCase.create(deps.authProviderGateway);
  const recoverPassword = RecoverPasswordUseCase.create(
    deps.authProviderGateway,
  );

  const controller = AuthController.create({
    registerAccount,
    login,
    refreshSession,
    signout,
    recoverPassword,
  });

  return authRoutes(controller, deps.authMiddleware);
}
