import 'dotenv/config';
import { ApiExpress } from '@/shared/http/express/api.express';
import { makeHealthModule } from '@/features/health/health.factory';
import { makeCategoryModule } from '@/features/category/category.factory';
import { makePaymentMethodModule } from '@/features/payment-method/payment-method.factory';
import { makePaymentStatusModule } from '@/features/payment-status/payment-status.factory';
import { makePersonModule } from '@/features/person/person.factory';
import { makeAuthModule } from '@/features/auth/auth.factory';
import { PersonGatewayAdapter } from '@/bootstrap/person.gateway.adapter';
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

  // Ordem suporte → consumidor: auth consome person via porta (adapter do bootstrap).
  const auth = makeAuthModule({
    authMiddleware,
    authProviderGateway,
    personGateway: PersonGatewayAdapter.create(person.internal),
  });

  const api = ApiExpress.create({
    routes: [
      ...makeHealthModule(),
      ...category.routes,
      ...paymentMethod,
      ...paymentStatus,
      ...person.routes,
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
