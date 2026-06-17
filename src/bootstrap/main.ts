import 'dotenv/config';
import { ApiExpress } from '@/shared/http/express/api.express';
import { makeHealthModule } from '@/features/health/health.factory';
import { makeCategoryModule } from '@/features/category/category.factory';
import { makePaymentMethodModule } from '@/features/payment-method/payment-method.factory';
import { makePaymentStatusModule } from '@/features/payment-status/payment-status.factory';
import { makePersonModule } from '@/features/person/person.factory';
import { makeAuthModule } from '@/features/auth/auth.factory';
import { makeWalletModule } from '@/features/wallet/wallet.factory';
import { makeTransferModule } from '@/features/transfer/transfer.factory';
import { makeFinancialIndicatorModule } from '@/features/financial-indicator/financial-indicator.factory';
import { PaymentMethodRepositoryFirestore } from '@/features/payment-method/infra/persistence/payment-method.repository.firestore';
import { TransferWalletGatewayAdapter } from '@/bootstrap/transfer-wallet.gateway.adapter';
import { TransferPaymentMethodGatewayAdapter } from '@/bootstrap/transfer-payment-method.gateway.adapter';
import { PersonGatewayAdapter } from '@/bootstrap/person.gateway.adapter';
import { WalletProvisionGatewayAdapter } from '@/bootstrap/wallet-provision.gateway.adapter';
import { FinancialIndicatorGatewayAdapter } from '@/bootstrap/financial-indicator.gateway.adapter';
import { AuthGatewayFirebase } from '@/features/person/infra/gateways/auth.gateway.firebase';
import { StorageGatewayFirebase } from '@/features/person/infra/gateways/storage.gateway.firebase';
import { clientFireBaseAdmin } from '@/packages/clients/firebase';
import { FirebaseStorageClient } from '@/packages/clients/firebase/firebase-storage.client';
import { AuthProviderGatewayFirebase } from '@/features/auth/infra/gateways/auth-provider.gateway.firebase';
import { VerifyTokenMiddleware } from '@/shared/http/express/middlewares/verify-token.middleware';
import { WinstonLogger } from '@/shared/logger/winston.logger';
import { RedisCacheRepository } from '@/shared/database/redis/cache.repository.redis';
import { clientRedis } from '@/shared/database/redis/redis.client';
import { CookiesMiddleware } from '@/shared/http/express/middlewares/cookies.middleware';
import { CorsMiddleware } from '@/shared/http/express/middlewares/cors.middleware';
import { IpControllMiddleware } from '@/shared/http/express/middlewares/ip-controll.middleware';
import { NormalizeIpHelper } from '@/shared/http/express/middlewares/normalize-ip';
import { ErrorMiddleware } from '@/shared/http/express/middlewares/error.middleware';
import { SwaggerSetup } from '@/shared/http/swagger/swagger-setup';

/**
 * Composition root da reescrita. Único lugar que conhece as factories e os
 * adapters concretos de `shared/`. Ordem: suporte → consumidores (CLAUDE.md §11).
 */
function main(): void {
  const logger = new WinstonLogger();
  const cache = RedisCacheRepository.create(clientRedis, logger);

  const cookies = new CookiesMiddleware();
  const cors = CorsMiddleware.create();
  const ipControll = new IpControllMiddleware(new NormalizeIpHelper());
  const errorMiddleware = ErrorMiddleware.create(logger);
  const swaggerSetup = SwaggerSetup.create();

  const db = clientFireBaseAdmin.firestore();
  const firebaseAuth = clientFireBaseAdmin.auth();
  const authProviderGateway = AuthProviderGatewayFirebase.create(firebaseAuth);
  const authMiddleware = VerifyTokenMiddleware.create(authProviderGateway);

  const category = makeCategoryModule({ db, authMiddleware });
  const paymentMethod = makePaymentMethodModule({ db, authMiddleware });
  const paymentStatus = makePaymentStatusModule({ db, authMiddleware });

  const authGateway = AuthGatewayFirebase.create(firebaseAuth);
  const storageGateway = StorageGatewayFirebase.create(
    FirebaseStorageClient.create(clientFireBaseAdmin.storage().bucket()),
  );
  const person = makePersonModule({
    db,
    logger,
    authMiddleware,
    authGateway,
    storageGateway,
  });

  // Suporte: indicadores globais (IOF) e wallet, ambos abaixo do core e do auth.
  const financialIndicator = makeFinancialIndicatorModule({ db });
  const wallet = makeWalletModule({
    db,
    authMiddleware,
    financialIndicatorGateway: FinancialIndicatorGatewayAdapter.create(
      financialIndicator.internal,
    ),
  });

  // Transferência: consome wallet e payment-method via portas (adapters do bootstrap), após o suporte.
  const transfer = makeTransferModule({
    db,
    authMiddleware,
    walletGateway: TransferWalletGatewayAdapter.create(db),
    paymentMethodGateway: TransferPaymentMethodGatewayAdapter.create(
      PaymentMethodRepositoryFirestore.create(db),
    ),
  });

  // Ordem suporte → consumidor: auth consome person e wallet via portas (adapters do bootstrap).
  const auth = makeAuthModule({
    authMiddleware,
    authProviderGateway,
    personGateway: PersonGatewayAdapter.create(person.internal),
    walletProvisionGateway: WalletProvisionGatewayAdapter.create(
      wallet.internal,
    ),
    logger,
  });

  const api = ApiExpress.create({
    routes: [
      ...makeHealthModule(),
      ...category.routes,
      ...paymentMethod,
      ...paymentStatus,
      ...person.routes,
      ...wallet.routes,
      ...transfer,
      ...auth,
    ],
    globalMiddlewares: [cookies, cors, ipControll],
    errorMiddleware,
    logger,
    cache,
    swaggerSetup,
  });

  const port = Number(process.env.PORT) || 8000;
  void api.start(port);
}

main();
